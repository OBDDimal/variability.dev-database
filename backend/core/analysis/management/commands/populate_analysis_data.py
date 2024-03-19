import pandas as pd
from django.core.management import BaseCommand

from core.fileupload.models import File

from core.analysis.models import AnalysisData


class Command(BaseCommand):
    #path_excel = "data.csv"
    help = 'Populate AnalysisData model from Excel file'

    def add_arguments(self, parser):
        parser.add_argument("/data.csv", type=str, help='Path to the Excel file')

    def handle(self, *args, **options):
        excel_file_path = options['/data.csv']

        # Read the Excel file using pandas
        df = pd.read_csv(excel_file_path, sep=',')
        i = 10 #id von den Files --> 10 erste ID
        # Iterate over rows in the DataFrame and populate the model
        for index, row in df.iterrows():
            # Get or create the File instance

            file_instance, created = File.objects.get_or_create(id=i)
            if i == 17: #bei Loch können ids ausgelassen
                i=129
            if i == 138:
                i = 141
            i += 1

            # Iterate over columns and create an AnalysisData instance for each
            for column, value in row.items():
                if column != 'File':
                    # Construct the key as the column title
                    key = column

                    # Create a dictionary for the 'value' field
                    value_data = {'value': value}

                    # Create or update the AnalysisData model
                    analysis_data, created = AnalysisData.objects.update_or_create(
                        file=file_instance,
                        key=key,
                        defaults={'value': value_data}
                    )

                    print(f"AnalysisData for {file_instance} - {key} {'created' if created else 'updated'}.")