import os
from enum import Enum

src_dir = os.path.dirname(os.path.abspath(__file__))
script_dir = os.path.dirname(src_dir)

class Env(Enum):
    DEV = 'dev'
    PROD = 'prod'
    
def load_env_vars(env: Env):
    file_path = os.path.join(src_dir, script_dir, f'{env.value}.env')

    with open(file_path, "r") as f:
        for line in f:
            line = line.strip()
            # Ignore empty lines and comments
            if line and not line.startswith("#"):
                # Split on the first occurrence of '='
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()