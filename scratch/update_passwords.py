import subprocess

hash_admin = '$2a$10$80gpmhu5xNdInCuNuQY6xukUQEc52tBUgfE/afGxhWzpKpZGuD1vK'
hash_clave = '$2a$10$pCSFZ0VVkmHF88riiwv1fuK2WvXhRW6XsiUr64pMMAowyhP7MLHsC'

sql = f"UPDATE usuarios SET password_hash = '{hash_admin}' WHERE usuario = 'admin'; UPDATE usuarios SET password_hash = '{hash_clave}' WHERE usuario != 'admin';"

subprocess.run([
    'docker', 'exec', 'escall-mysql', 'mysql',
    '-uroot', '-pescall_root_password_2026', 'escall_avance3',
    '-e', sql
], check=True)

print("BCrypt hashes updated successfully.")
