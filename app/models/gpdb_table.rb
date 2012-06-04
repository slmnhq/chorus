class GpdbTable < GpdbDatabaseObject

  TABLE_STATS_SQL = <<-SQL
    SELECT
      c.relname AS table_name, c.reltuples AS rows, c.relnatts AS columns, d.description AS description, s.statime AS last_analyzed,
      (SELECT COUNT(tablename) FROM pg_catalog.pg_partitions WHERE schemaname = :schema AND tablename = :table_name) AS partition_count,
      CASE WHEN position('''' in c.relname) > 0 THEN 'unknown'
           WHEN position('\\' in c.relname) > 0 THEN 'unknown'
           ELSE pg_size_pretty(pg_total_relation_size(c.oid))
      END AS disk_size,
      CASE WHEN c.relhassubclass = 't' THEN 'MASTER_TABLE'
           WHEN e.location is NULL THEN 'BASE_TABLE'
           WHEN position('gphdfs' in e.location[1]) > 0 THEN 'HD_EXT_TABLE'
           WHEN position('gpfdist' in e.location[1]) > 0 THEN 'EXT_TABLE'
           ELSE 'UNKNOWN_TABLE_TYPE'
      END AS table_type
    FROM pg_namespace n
    LEFT JOIN pg_class c
      ON (n.oid=c.relnamespace)
      AND (n.nspname= :schema)
    LEFT JOIN pg_description d
      ON (c.oid=d.objoid)
    LEFT JOIN pg_stat_last_operation s
      ON (c.oid=s.objid)
      AND s.staactionname='ANALYZE'
    LEFT JOIN pg_exttable e ON (c.oid=e.reloid)
    WHERE c.relname = :table_name;
  SQL

  def stats(account)
    table_stats = schema.with_gpdb_connection(account) do |conn|
      conn.select_all(ActiveRecord::Base.__send__(:sanitize_sql, [TABLE_STATS_SQL, :schema => schema.name, :table_name => name], ''))
    end

    stats = GpdbTableStatistics.new
    stats.table_name = table_stats[0]["table_name"]
    stats.table_type = table_stats[0]["table_type"]
    stats.rows = table_stats[0]["rows"]
    stats.columns = table_stats[0]["columns"]
    stats.description = table_stats[0]["description"]
    stats.last_analyzed = Time.parse(table_stats[0]["last_analyzed"]).utc
    stats.disk_size = table_stats[0]["disk_size"]
    stats.partition_count = table_stats[0]["partition_count"]

    stats
  end

end
