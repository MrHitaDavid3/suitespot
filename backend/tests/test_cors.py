import importlib

from fastapi.testclient import TestClient

import main


def allowed_origin(client, origin):
    r = client.options(
        "/health", headers={"Origin": origin, "Access-Control-Request-Method": "GET"}
    )
    return r.headers.get("access-control-allow-origin")


def test_cors_origins_from_env(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000/, https://suitespot.vercel.app")
    try:
        client = TestClient(importlib.reload(main).app)
        for origin in (
            "http://localhost:3000",
            "https://suitespot.vercel.app",
            "https://suitespot-git-some-branch-team.vercel.app",
        ):
            assert allowed_origin(client, origin) == origin
        assert allowed_origin(client, "https://evil.example") is None
    finally:
        monkeypatch.undo()
        importlib.reload(main)