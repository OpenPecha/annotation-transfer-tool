WITNESS_A = "བཀྲ་ཤིས་ཀུན་གྱི་བཀྲ་ཤིས་པའི།"
WITNESS_B = "བཀྲ་ཤིས་ཀུད་གྱི་བཀྲ་ཤིས་པའི།"
WITNESS_C = "བཀྲ་ཤིས་ཀུད་ཀྱི་བཀྲ་ཤིས་པས།"


def run_collation(client):
    parts = []
    for name, content in [
        ("Derge", WITNESS_A),
        ("Narthang", WITNESS_B),
        ("Lhasa", WITNESS_C),
    ]:
        parts.append(
            ("files", (f"{name.lower()}.txt", content.encode("utf-8"), "text/plain"))
        )
        parts.append(("names", (None, name)))
    parts.extend(
        [
            ("base_witness_name", (None, "Derge")),
            ("language", (None, "bo")),
        ]
    )
    response = client.post("/api/collation", files=parts)
    assert response.status_code == 200
    return response.json()
