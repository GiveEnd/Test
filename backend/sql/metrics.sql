SELECT 
    m.id as metric_id,
    m.datetime as metric_timestamp,
    m.cpu_utilization as cpu_value,
    m.memory_utilization as memory_value,
    m.disk_utilization as disk_value,
    n.id as node_id,
    n.caption as node_name,
    s.Id as status_id,
    s.color as node_status_color,
    s.description as node_status_description
FROM metrics m
LEFT JOIN nodes n ON n.id = m.node_id
LEFT JOIN statuses s ON s.Id = n.status
ORDER BY m.datetime DESC, n.id;
