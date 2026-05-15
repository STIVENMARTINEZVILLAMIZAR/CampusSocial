"""
Almacenamiento JSON de borradores de publicaciones sociales
"""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any


class DraftsStorage:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.file_path.exists():
            self._write({'drafts': []})

    def _read(self) -> dict:
        with open(self.file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _write(self, data: dict) -> None:
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def list_drafts(self, status: str | None = None) -> list[dict]:
        drafts = self._read().get('drafts', [])
        if status:
            return [d for d in drafts if d.get('status') == status]
        return drafts

    def get_draft(self, draft_id: str) -> dict | None:
        for draft in self.list_drafts():
            if draft.get('id') == draft_id:
                return draft
        return None

    def create_draft(self, payload: dict) -> dict:
        data = self._read()
        draft = {
            'id': str(uuid.uuid4()),
            'status': 'pendiente',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            **payload,
        }
        data['drafts'].insert(0, draft)
        self._write(data)
        return draft

    def update_draft(self, draft_id: str, updates: dict) -> dict | None:
        data = self._read()
        for i, draft in enumerate(data['drafts']):
            if draft.get('id') == draft_id:
                data['drafts'][i] = {
                    **draft,
                    **updates,
                    'updated_at': datetime.now().isoformat(),
                }
                self._write(data)
                return data['drafts'][i]
        return None

    def delete_draft(self, draft_id: str) -> bool:
        data = self._read()
        before = len(data['drafts'])
        data['drafts'] = [d for d in data['drafts'] if d.get('id') != draft_id]
        self._write(data)
        return len(data['drafts']) < before
