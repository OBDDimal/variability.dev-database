import binascii
import os

from core.fileupload.models import Analysis, AnalysisResult

def generate_random_string(n):
    return binascii.hexlify(os.urandom(n)).decode('ascii')

def get_triggerable_analyses():
    return AnalysisResult.objects.raw(
        """SELECT * FROM core_fileupload_analysisresult as outer WHERE
            triggered = false AND
            NOT EXISTS(
                SELECT inner.id, inner.result FROM core_fileupload_analysisresult as inner
                JOIN core_fileupload_analysis as outer_analysis ON outer.analysis_id = outer_analysis.id
                JOIN core_fileupload_analysis as inner_analysis ON inner.analysis_id = inner_analysis.id
                JOIN core_fileupload_analysis_depends_on as depends_on ON outer_analysis.id = depends_on.from_analysis_id AND inner_analysis.id = depends_on.to_analysis_id
                    WHERE inner.result IS NULL
            );
        """)

def trigger_all_triggerable_analyses():
    for analysis_result in get_triggerable_analyses():
        # TODO: Actually trigger the analysis

        # Set the analysis to triggered
        analysis_result.triggered = True
        analysis_result.save()
