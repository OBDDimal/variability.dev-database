from django.test import TestCase
from .models import File
import json


class FeatureModelsTest(TestCase):
    def test_all_models_included(self):
        def get_feature_models():
            data = self.client.get('/api/feature-models/')
            return json.loads(data.content)['data']

        # test that no data is returned if database is empty
        self.assertEqual(len(get_feature_models()), 0,
                         'Initial feature model list is not empty')

        # test that a feature model is returned if one is added
        new_model = File.objects.create(
            description='Testfile',
            format='DIMACS',
            author='Test Case',
            license='CC',
            public=True,
            hash='123456789')
        feature_models = get_feature_models()
        self.assertEqual(len(feature_models), 1,
                         f'Expected 1 feature model, got {len(feature_models)} instead')
        self.assertEqual(new_model.description, feature_models[0].get(
            'description'), 'Feature model description does not match')
        self.assertEqual(new_model.format, feature_models[0].get(
            'format'), 'Feature model format does not match')
        self.assertEqual(new_model.author, feature_models[0].get(
            'author'), 'Feature model author does not match')
        self.assertEqual(new_model.license, feature_models[0].get(
            'license'), 'Feature model license does not match')
        self.assertEqual(new_model.hash, feature_models[0].get(
            'hash'), 'Feature model hash does not match')

        File.objects.create(description='Another file from a test', format='DIMACS',
                            author='Test Case', license='CC', public=True, hash='234567891')

        File.objects.create(description='A 3rd file from a test', format='DIMACS',
                            author='Test Case', license='CC', public=True, hash='345678912')

        self.assertEqual(len(get_feature_models(
        )), 3, f'Expected 3 feature models but got {len(get_feature_models())} instead')

    def test_pageination_feature_models(self):
        # returns metadata as well this time
        def get_data(url='/api/feature-models/'):
            data = self.client.get(url)
            return json.loads(data.content)

        self.assertEqual(len(get_data()['data']), 0,
                         'Initial feature model list is not empty')

        feature_model_amount = 150
        for i in range(feature_model_amount):
            File.objects.create(
                description=f'this is file #{i}', format='DIMACS', author='Test Case', license='CC', public=True, hash=f'{i}')

        self.assertEqual(get_data()['meta']['total_elements'], feature_model_amount,
                         f'Expected {feature_model_amount} feature models but found {len(get_data())}')

        # test page size set correctly
        for page_size in [1, 7, 10, 27, 58]:
            data = get_data(
                f'/api/feature-models/?page_size={page_size}')['data']
            self.assertEqual(len(data), page_size)

        # test weird page sized getting reset to default of 20:
        for page_size in [-10, -1, 0]:
            data = get_data(
                f'/api/feature-models/?page_size={page_size}')['data']
            self.assertEqual(len(data), 20)

        #test page size reset to 100 if too large
        for page_size in [101, 170, 23000000000000]:
            data = get_data(
                f'/api/feature-models/?page_size={page_size}')['data']
            self.assertEqual(len(data), 100)

        #test that the right page is sent
        for page in [1,2,5, 7,22, 73]:
            meta = get_data(f'/api/feature-models/?page_size=5&page={page}')['meta']
            self.assertEqual(meta['page_number'], page)

        #test that negative page numbers are set to 0
        for page in [0, -1, -5, -12821]:
            meta = get_data(f'/api/feature-models/?page_size=5&page={page}')['meta']
            self.assertEqual(meta['page_number'], 1)

    def test_filter_feature_models(self):
        # returns metadata as well this time
        def get_data(url='/api/feature-models/'):
            data = self.client.get(url)
            return json.loads(data.content)['data']
        return