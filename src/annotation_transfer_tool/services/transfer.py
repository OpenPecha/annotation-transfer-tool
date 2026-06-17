from fast_antx.core import transfer

from annotation_transfer_tool.schemas.transfer import TransferRequest, TransferResponse


def run_transfer(request: TransferRequest) -> TransferResponse:
    patterns = [
        [label, regex]
        for label, regex in request.patterns
        if label and regex
    ]

    result = transfer(
        request.source,
        patterns,
        request.target,
        output=request.output,
    )

    return TransferResponse(result=result, output_format=request.output)
