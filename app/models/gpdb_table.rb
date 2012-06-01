class GpdbTable < GpdbDatabaseObject

  TABLE_STATS_SQL = <<-SQL
    SELECT c.relname AS table_name, c.reltuples AS rows, c.relnatts AS columns, c.relhassubclass AS master_table, d.description AS description, s.statime AS last_analyzed, e.location as protocol,
          (SELECT COUNT(tablename) FROM pg_catalog.pg_partitions WHERE schemaname = :schema AND tablename = :table_name) AS partition_count,
      CASE WHEN position('''' in c.relname) > 0 THEN 'unknown'
      WHEN position('\\' in c.relname) > 0 THEN 'unknown'
      ELSE pg_size_pretty(pg_total_relation_size(c.oid))
      END AS disk_size
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
    stats.rows = table_stats[0]["rows"]
    stats.columns = table_stats[0]["columns"]
    stats.master_table = table_stats[0]["master_table"] == 't' ? true : false
    stats.description = table_stats[0]["description"]
    stats.last_analyzed = table_stats[0]["last_analyzed"]
    stats.protocol = table_stats[0]["protocol"]
    stats.disk_size = table_stats[0]["disk_size"]
    stats.partition_count = table_stats[0]["partition_count"]

    stats
  end

end
