# views_api.py is for you API endpoints that could be hit by another service

import httpx
# (use httpx just like requests, except instead of response.ok there's only the
#  response.is_error that is its inverse)

from quart import jsonify
from http import HTTPStatus

from . import bitclouds_ext


# add your endpoints here


@bitclouds_ext.route("/api/v1/server_types", methods=["GET"])
async def api_example():
    """
    Grab all server image types from Bitclouds.
    """
    resp = httpx.get(
            "https://bitclouds.sh/images/"
            )
    if not resp.is_error:
        return jsonify(resp.json()['images'])

    return jsonify({
            'error': 'unknown',
            }), HTTPStatus.SERVICE_UNAVAILABLE
