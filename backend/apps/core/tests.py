from django.test import TestCase
from django.urls import reverse


class CoreSmokeTests(TestCase):
    def test_home_endpoint_returns_success_payload(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['project'], 'Traviona')
        self.assertEqual(response.json()['status'], 'ok')


class HealthCheckTests(TestCase):
    def test_health_check_endpoint(self):
        response = self.client.get(reverse('health-check'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ok')


class ApiSchemaTests(TestCase):
    def test_schema_endpoint_returns_openapi_contract(self):
        response = self.client.get(reverse('api-schema'), HTTP_ACCEPT='application/vnd.oai.openapi+json')

        self.assertEqual(response.status_code, 200)
        schema = response.json()
        operation_ids = [
            operation['operationId']
            for path_item in schema['paths'].values()
            for operation in path_item.values()
        ]

        self.assertEqual(schema['info']['title'], 'Traviona API')
        self.assertIn('/api/users/login/', schema['paths'])
        self.assertEqual(len(operation_ids), len(set(operation_ids)))
