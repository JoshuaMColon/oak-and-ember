-- Advisor fix (auth_rls_initplan): evaluate auth.jwt() once per statement
-- in the restrictive "no anonymous …" policies on oak tables.
do $$
declare
  r record;
  expr text := $x$coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false$x$;
begin
  for r in
    select tablename, policyname, cmd from pg_policies
    where schemaname = 'oak' and policyname like 'no anonymous %'
  loop
    if r.cmd = 'INSERT' then
      execute format('alter policy %I on oak.%I with check (%s)', r.policyname, r.tablename, expr);
    elsif r.cmd = 'UPDATE' then
      execute format('alter policy %I on oak.%I using (%s) with check (%s)', r.policyname, r.tablename, expr, expr);
    else
      execute format('alter policy %I on oak.%I using (%s)', r.policyname, r.tablename, expr);
    end if;
  end loop;
end $$;
