#!/usr/bin/env python3
# Copyright (C) 2026 Deutsche Telekom AG. Licensed under Apache-2.0.
"""Exercise startup argument handling without starting a JVM."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('startup.sh')


class StartupTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.base = Path(self.directory.name)
        (self.base / 'start.d').mkdir()
        self.calls = self.base / 'calls.jsonl'
        java = self.base / 'java'
        java.write_text('''#!/usr/bin/env python3
import json, os, sys
with open(os.environ['JAVA_CALLS'], 'a') as output:
    output.write(json.dumps(sys.argv[1:]) + '\\n')
if os.environ.get('FAIL_MODULE') and any(x.startswith('--add-') for x in sys.argv):
    sys.exit(12)
''')
        java.chmod(0o755)
        self.env = dict(os.environ, PATH=str(self.base) + os.pathsep + os.environ['PATH'],
                        JETTY_BASE=str(self.base), JETTY_HOME='/jetty',
                        JAVA_CALLS=str(self.calls), BACKEND='https://upstream:8443/base')
        for key in ('JAVA_OPTIONS', 'IS_HTTPS', 'KEYSTORE_PATH', 'KEYSTORE_PASS',
                    'TRUSTSTORE_PATH', 'TRUSTSTORE_PASS', 'TRUST_ALL'):
            self.env.pop(key, None)

    def run_startup(self, **settings):
        return subprocess.run(['sh', str(SCRIPT)], cwd=self.base,
                              env=dict(self.env, **settings), capture_output=True, text=True)

    def last_call(self):
        return json.loads(self.calls.read_text().splitlines()[-1])

    def test_distinct_stores_and_passwords_with_spaces(self):
        result = self.run_startup(IS_HTTPS='true', KEYSTORE_PATH='etc/client key.p12',
                                 KEYSTORE_PASS='key secret', TRUSTSTORE_PATH='/mounted/server trust.p12',
                                 TRUSTSTORE_PASS='trust secret', JAVA_OPTIONS='-Xms32m -Xmx64m')
        self.assertEqual(0, result.returncode, result.stderr)
        args = self.last_call()
        self.assertIn('-DkeystorePath=' + str(self.base / 'etc/client key.p12'), args)
        self.assertIn('-DtruststorePath=/mounted/server trust.p12', args)
        self.assertIn('-DtruststorePassword=trust secret', args)
        self.assertIn('-Xms32m', args)
        self.assertIn('-Xmx64m', args)
        self.assertNotIn('key secret', result.stdout + result.stderr)
        self.assertNotIn('trust secret', result.stdout + result.stderr)

    def test_server_properties_follow_the_jar_argument(self):
        result = self.run_startup(IS_HTTPS='true', KEYSTORE_PATH='key.p12', KEYSTORE_PASS='secret')
        self.assertEqual(0, result.returncode, result.stderr)
        args = self.last_call()
        jar = args.index('-jar')
        self.assertTrue(all(arg.startswith('-') for arg in args[:jar]))
        self.assertTrue(any(arg.startswith('jetty.sslContext.keyStorePath=') for arg in args[jar + 2:]))

    def test_outbound_tls_can_be_configured_with_http_frontend(self):
        result = self.run_startup(TRUSTSTORE_PATH='etc/server.p12', TRUSTSTORE_PASS='secret', TRUST_ALL='false')
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn('-DtruststorePath=' + str(self.base / 'etc/server.p12'), self.last_call())
        self.assertIn('-DsslTrustAll=false', self.last_call())

    def test_missing_backend_fails_before_starting_java(self):
        result = self.run_startup(BACKEND='')
        self.assertNotEqual(0, result.returncode)
        self.assertFalse(self.calls.exists())

    def test_configuration_does_not_accumulate_on_restart(self):
        first = self.run_startup()
        before = {p.name: p.read_text() for p in (self.base / 'start.d').glob('*')}
        second = self.run_startup()
        self.assertEqual(0, first.returncode, first.stderr)
        self.assertEqual(0, second.returncode, second.stderr)
        self.assertEqual(before, {p.name: p.read_text() for p in (self.base / 'start.d').glob('*')})

    def test_module_failure_prevents_server_start(self):
        result = self.run_startup(IS_HTTPS='true', KEYSTORE_PATH='key.p12', KEYSTORE_PASS='secret', FAIL_MODULE='1')
        self.assertNotEqual(0, result.returncode)
        self.assertTrue(all(any(arg.startswith('--add-') for arg in json.loads(line))
                            for line in self.calls.read_text().splitlines()))


if __name__ == '__main__':
    unittest.main()
