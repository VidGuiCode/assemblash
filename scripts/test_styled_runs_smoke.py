"""Check version routing and executed archive evidence without downloads."""
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

from check_release_archive import check_styled_runs, supports_styled_runs


class ArchiveRouting(unittest.TestCase):
    def test_historical_and_new_release_versions(self):
        for tag in ["v1.0.0", "1.11.0", "v1.11.99"]:
            self.assertFalse(supports_styled_runs(tag))
        for tag in ["v1.12.0", "1.12.0-rc.1", "v1.13.0", "v2.0.0"]:
            self.assertTrue(supports_styled_runs(tag))

    def test_archive_runs_actual_smoke_and_requires_executed_success(self):
        with patch("check_release_archive.subprocess.run") as child:
            child.return_value = subprocess.CompletedProcess([], 0, json.dumps({"ok": True, "executed": True}))
            self.assertTrue(check_styled_runs(Path("binary"), Path("workspace"))["executed"])
            self.assertTrue(any(str(arg).endswith("styled_runs_smoke.py") for arg in child.call_args.args[0]))
            child.return_value = subprocess.CompletedProcess([], 0, json.dumps({"ok": True, "executed": False}))
            with self.assertRaises(RuntimeError):
                check_styled_runs(Path("binary"), Path("workspace"))


if __name__ == "__main__":
    unittest.main()
