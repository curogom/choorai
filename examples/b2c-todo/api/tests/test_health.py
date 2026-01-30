def test_health_returns_ok(client):
    """Health endpoint는 status: ok를 반환해야 함"""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "timestamp" in data
