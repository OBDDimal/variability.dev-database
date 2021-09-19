from django.test import TestCase

from github import Github
import os
import sys

from . import github_manager as gm

repo_name = ''
if(repo_name == ''):
    print('No github repo for test cases set')
    sys.exit()
g = Github(login_or_token=os.getenv('GITHUB_TOKEN'))


class Create_or_update_file_test(TestCase):

    def setUp(self):
        self.repo = g.get_repo(repo_name)
        self.branch_name = 'fileTest'

    def test_create_new_files(self):
        file_name = 'basic_test_file.txt'
        file_content = 'This test case makes sure new files are created at the right place'
        # delete file if it already exists from prior tests:
        if file_name in [file.name for file in self.repo.get_contents('', ref=self.branch_name)]:
            file_to_delete = self.repo.get_contents(
                file_name, ref=self.branch_name)
            self.repo.delete_file(file_name, 'Deleted file for test case',
                                  sha=file_to_delete.sha, branch=self.branch_name)
        # make sure the repo doesnt have a file yet
        for file in self.repo.get_contents('', ref=self.branch_name):
            self.assertNotEqual(
                file.name, file_name, f'Create or update file test failed: File already exists: {file_name}')
        # call function
        gm.create_or_update_file(file_name, file_name,
                                 file_content, self.branch_name)
        # make sure new file exists
        file_names_in_repo = [
            file.name for file in self.repo.get_contents('', ref=self.branch_name)]
        self.assertIn(file_name, file_names_in_repo,
                      'Create or update file test failed: File not created successfully')
        # make sure the file contents are set correctly:
        self.assertEqual(file_content, self.repo.get_contents(
            file_name, ref=self.branch_name).decoded_content.decode(), 'Create or update file test failed: File content does not match')

    def test_update_file(self):
        file_name = 'basic_test_file.txt'
        new_file_content = 'This test case makes sure the content of a file gets overwritten correctly'
        # make sure the file exists already
        self.assertIn(file_name, [file.name for file in self.repo.get_contents(
            '', ref=self.branch_name)], 'Test update file failed: File to modify does not exist')
        # make sure the file content doesnt match yet
        self.assertNotEqual(new_file_content, self.repo.get_contents(
            file_name, ref=self.branch_name).decoded_content.decode(), 'Test update failed: File content already matches')
        # call the function
        gm.create_or_update_file(file_name, file_name,
                                 new_file_content, self.branch_name, repo_name)
        # make sure file still exists:
        self.assertIn(file_name, [file.name for file in self.repo.get_contents(
            '', ref=self.branch_name)], 'Test update file failed: Modified file does not exist anymore')
        # test if file content matches:
        self.assertEqual(new_file_content, self.repo.get_contents(
            file_name, ref=self.branch_name).decoded_content.decode(), 'Test update failed: File content does not match')

    def test_create_branch(self):
        branch_name = 'new_test_branch'
        # make sure branch does not exist yet
        if branch_name in [branch.name for branch in self.repo.get_branches()]:
            branch_ref = self.repo.get_git_ref(f'heads/{branch_name}')
            branch_ref.delete()
        self.assertNotIn(branch_name, [branch.name for branch in self.repo.get_branches(
        )], 'Create branch test failed: Branch does already exist')
        # call function
        gm.create_branch(branch_name)
        # make sure branch exists now
        self.assertIn(branch_name, [branch.name for branch in self.repo.get_branches(
        )], 'Create branch test failed: Branch was not created')
