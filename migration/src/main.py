import argparse
import datetime
import importlib
import logging
import os
from env import Env, load_env_vars

script_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.dirname(script_dir)
data_dir = os.path.join(src_dir, 'data')

def setup_logging():
    if not os.path.exists(data_dir):
        os.mkdir(data_dir)
    current_datetime = datetime.datetime.now() \
        .strftime("%Y-%m-%d %H:%M:%S")
    current_datetime_safe = current_datetime.replace(' ', '_').replace(':', '_')
    log_path = os.path.join(data_dir, f'migration_{current_datetime_safe}.log')
    logging.basicConfig(filename=log_path, level=logging.DEBUG)

def parse_args():
    parser = argparse.ArgumentParser(description='Run migration script for a specific environment.')
    parser.add_argument('migration_script_name', type=str, help='Name of the migration script file')
    parser.add_argument('-e', '--environment', type=Env, choices=Env, default=Env.DEV, help='Environment (dev or prod)')
    return parser.parse_args()

def import_and_run(module_name: str):
    try:
        migration_module = importlib.import_module(module_name)
    except ImportError:
        print(f"Error: Migration script not found. {module_name}")
        return
    
    try:
        migration_module.run()
    except AttributeError:
        print("Error: Migration script does not have a 'run' method.")
        return

def main():
    setup_logging()
    args = parse_args()
    load_env_vars(args.environment)
    migration_script_module = f'migration_scripts.{args.migration_script_name}'
    import_and_run(migration_script_module)

if __name__ == "__main__":
    main()
