from flask import Flask

from src.infra.db import mimic_db_operations
from src.routes.prices import add_routes

app = Flask("lift-pass-pricing")

db_like = mimic_db_operations()
add_routes(app, db_like)

if __name__ == "__main__":
    app.run(port=3005)
