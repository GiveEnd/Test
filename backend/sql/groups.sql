SELECT
    g.id as group_id,
    g.caption as group_name,
    n.id as node_id,
    n.caption as node_name,
    s.Id as status_id,
    s.color as node_status_color,
    s.description as node_status_description,
    i.id as interface_id,
    i.caption as interface_name,
    i.status as interface_status,
    a.id as application_id,
    a.caption as application_name,
    u.id as admin_id,
    u.firstname as admin_firstname,
    u.lastname as admin_lastname,
    u.email as admin_email
FROM groups g
LEFT JOIN groups_nodes gn ON gn.group_id = g.id
LEFT JOIN nodes n ON n.id = gn.node_id
LEFT JOIN statuses s ON s.Id = n.status
LEFT JOIN interfaces i ON i.id = n.interface
LEFT JOIN nodes_applications na ON na.node_id = n.id
LEFT JOIN applications a ON a.id = na.application_id
LEFT JOIN users u ON u.id = n.admin
ORDER BY g.id, n.id, i.id, a.id;
