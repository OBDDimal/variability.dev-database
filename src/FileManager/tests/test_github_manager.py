from django.test import TestCase

from github import Github
import os

import github_manager as gm

repo_name = 'Sean-Duft/github-api-tests'
g = Github(login_or_token=os.getenv('GITHUB-TOKEN'))

class Create_or_update_file_test(TestCase):

    def __init__(self):
        print(repo_name)
        self.repo = g.get_repo(repo_name)
        self.branch_name = 'fileTest'

    def test_create_new_files(self):
        file_name = 'basic_test_file.txt'
        file_content = 'This test case makes sure new files are created at the right place'
        # make sure the repo doesnt have a file yet
        for file in self.repo.get_contents(''):
            self.assertNotEqual(
                file.name, file_name, f'Create or update file test failed: File already exists: {file_name}')
        # call function
        gm.create_or_update_file('', file_name, file_content, self.branch_name)
        # make sure new file exists
        file_names_in_repo = [file.name for file in self.repo.get_contents('')]
        self.assertIn(file_name, file_names_in_repo,
                      'Create or update file test failed: File not created successfully')
        # make sure the file contents are set correctly:
        self.assertEqual(file_content, self.repo.get_contents(
            file_name).decoded_content.decode(), 'Create or update file test failed: File content does not match')
