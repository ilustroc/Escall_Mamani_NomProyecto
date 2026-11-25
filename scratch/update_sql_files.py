for path in [
    r'C:\GitHub\Escall_Mamani_NomProyecto\database\01_esquema.sql',
    r'C:\GitHub\Escall_Mamani_NomProyecto\database\script_base_datos.sql'
]:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_hash = "$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i"
    admin_old = f"('admin', 'Administrador del sistema', 'admin@escall.pe', '{old_hash}'"
    admin_new = "('admin', 'Administrador del sistema', 'admin@escall.pe', '$2a$10$80gpmhu5xNdInCuNuQY6xukUQEc52tBUgfE/afGxhWzpKpZGuD1vK'"
    
    content = content.replace(admin_old, admin_new)
    content = content.replace(old_hash, "$2a$10$pCSFZ0VVkmHF88riiwv1fuK2WvXhRW6XsiUr64pMMAowyhP7MLHsC")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("SQL files updated successfully with valid BCrypt hashes.")
