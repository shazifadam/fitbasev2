-- Database function: get_monthly_stats
-- Replaces 7 application-layer queries with a single DB round-trip
CREATE OR REPLACE FUNCTION get_monthly_stats(
  p_trainer_id UUID,
  p_year INT,
  p_month INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_start DATE;
  v_month_end DATE;
  v_prev_month_start DATE;
  v_prev_month_end DATE;
  v_today DATE := CURRENT_DATE;
  v_week_start DATE;
  v_week_end DATE;
  v_result JSON;
BEGIN
  -- Current month range
  v_month_start := make_date(p_year, p_month, 1);
  v_month_end := (v_month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Previous month range
  v_prev_month_start := (v_month_start - INTERVAL '1 month')::DATE;
  v_prev_month_end := (v_month_start - INTERVAL '1 day')::DATE;

  -- Current week range (Monday to Sunday)
  v_week_start := v_today - ((EXTRACT(ISODOW FROM v_today)::INT - 1) || ' days')::INTERVAL;
  v_week_end := v_week_start + INTERVAL '6 days';

  SELECT json_build_object(
    'total_income', COALESCE((
      SELECT SUM(amount)
      FROM payments
      WHERE trainer_id = p_trainer_id
        AND payment_date >= v_month_start
        AND payment_date <= v_month_end
    ), 0),

    'previous_month_income', COALESCE((
      SELECT SUM(amount)
      FROM payments
      WHERE trainer_id = p_trainer_id
        AND payment_date >= v_prev_month_start
        AND payment_date <= v_prev_month_end
    ), 0),

    'active_clients', (
      SELECT COUNT(*)
      FROM clients
      WHERE trainer_id = p_trainer_id
        AND is_archived = false
    ),

    'new_clients_this_month', (
      SELECT COUNT(*)
      FROM clients
      WHERE trainer_id = p_trainer_id
        AND is_archived = false
        AND created_at::DATE >= v_month_start
        AND created_at::DATE <= v_month_end
    ),

    'attendance_rate', COALESCE((
      SELECT ROUND(
        COUNT(*) FILTER (WHERE status = 'attended')::NUMERIC * 100.0
        / NULLIF(COUNT(*) FILTER (WHERE status IN ('attended', 'missed')), 0)
      )
      FROM attendance
      WHERE trainer_id = p_trainer_id
        AND scheduled_date >= v_month_start
        AND scheduled_date <= v_month_end
    ), 0),

    'previous_attendance_rate', COALESCE((
      SELECT ROUND(
        COUNT(*) FILTER (WHERE status = 'attended')::NUMERIC * 100.0
        / NULLIF(COUNT(*) FILTER (WHERE status IN ('attended', 'missed')), 0)
      )
      FROM attendance
      WHERE trainer_id = p_trainer_id
        AND scheduled_date >= v_prev_month_start
        AND scheduled_date <= v_prev_month_end
    ), 0),

    'payment_status', (
      SELECT json_build_object(
        'active', COUNT(*) FILTER (WHERE days_left > 7),
        'expiring', COUNT(*) FILTER (WHERE days_left BETWEEN 0 AND 7),
        'expired', COUNT(*) FILTER (WHERE days_left < 0 OR days_left IS NULL)
      )
      FROM (
        SELECT c.id,
          (SELECT (p.valid_until - v_today)
           FROM payments p
           WHERE p.client_id = c.id AND p.trainer_id = p_trainer_id
           ORDER BY p.payment_date DESC
           LIMIT 1
          ) AS days_left
        FROM clients c
        WHERE c.trainer_id = p_trainer_id
          AND c.is_archived = false
      ) client_payments
    ),

    'sessions_this_week', (
      SELECT COALESCE(json_agg(
        json_build_object('day', d.label, 'count', COALESCE(s.cnt, 0))
        ORDER BY d.idx
      ), '[]'::json)
      FROM (
        VALUES (0, 'Mon'), (1, 'Tue'), (2, 'Wed'), (3, 'Thu'), (4, 'Fri'), (5, 'Sat'), (6, 'Sun')
      ) AS d(idx, label)
      LEFT JOIN (
        SELECT (EXTRACT(ISODOW FROM scheduled_date)::INT - 1) AS dow,
               COUNT(*) AS cnt
        FROM attendance
        WHERE trainer_id = p_trainer_id
          AND scheduled_date >= v_week_start
          AND scheduled_date <= v_week_end
          AND status = 'attended'
        GROUP BY dow
      ) s ON s.dow = d.idx
    ),

    'total_sessions_this_week', (
      SELECT COUNT(*)
      FROM attendance
      WHERE trainer_id = p_trainer_id
        AND scheduled_date >= v_week_start
        AND scheduled_date <= v_week_end
        AND status = 'attended'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
