from __future__ import annotations

import copy
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path

from pydurma_web.schemas.collation import AlignmentRow, CollationConfig, RowSelectionState
from pydurma_web.services.matrix import Witness


@dataclass
class CollationSession:
    job_id: str
    weighted_matrix: list
    witnesses: list[Witness]
    aligner_witnesses: list[Witness]
    config: CollationConfig
    rows: list[AlignmentRow]
    suggested_vulgate: str
    version_paths: list[Path]
    versions_to_serialize: dict[str, str]
    selections: dict[str, RowSelectionState] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)


SESSION_TTL_SECONDS = 3600
_sessions: dict[str, CollationSession] = {}


def _purge_expired() -> None:
    now = time.time()
    expired = [
        job_id
        for job_id, session in _sessions.items()
        if now - session.created_at > SESSION_TTL_SECONDS
    ]
    for job_id in expired:
        del _sessions[job_id]


def create_session(
    weighted_matrix,
    witnesses: list[Witness],
    aligner_witnesses: list[Witness],
    config: CollationConfig,
    rows: list[AlignmentRow],
    suggested_vulgate: str,
    version_paths: list[Path],
    versions_to_serialize: dict[str, str],
) -> str:
    _purge_expired()
    job_id = str(uuid.uuid4())
    _sessions[job_id] = CollationSession(
        job_id=job_id,
        weighted_matrix=weighted_matrix,
        witnesses=witnesses,
        aligner_witnesses=aligner_witnesses,
        config=config,
        rows=rows,
        suggested_vulgate=suggested_vulgate,
        version_paths=version_paths,
        versions_to_serialize=versions_to_serialize,
    )
    return job_id


def get_session(job_id: str) -> CollationSession | None:
    _purge_expired()
    session = _sessions.get(job_id)
    if session is None:
        return None
    if time.time() - session.created_at > SESSION_TTL_SECONDS:
        del _sessions[job_id]
        return None
    return session


def update_session_selections(
    job_id: str, selections: dict[str, RowSelectionState]
) -> bool:
    session = get_session(job_id)
    if session is None:
        return False
    session.selections = selections
    return True


def clone_matrix_for_export(session: CollationSession):
    return copy.deepcopy(session.weighted_matrix)
