# views_api.py is for you API endpoints that could be hit by another service

import httpx

# (use httpx just like requests, except instead of response.ok there's only the
#  response.is_error that is its inverse)

from quart import jsonify, request
from http import HTTPStatus
from lnbits import bolt11
from lnbits.core.services import pay_invoice
# from lnbits.decorators import api_check_admin_key

from . import bitclouds_ext


# add your endpoints here


@bitclouds_ext.route("/api/v1/request_invoice", methods=["POST"])
async def request_image_invoice():
    """
    Request an image of a certain type
    """
    image = (await request.get_json())["image"]

    resp = httpx.get(f"https://bitclouds.sh/create/{image}")
    if not resp.is_error:
        resp_data = resp.json()
        payment_request = resp_data["paytostart"]
        decoded_invoice = bolt11.decode(payment_request)
        resp_data["payment_data"] = {
            "payment_hash": decoded_invoice.payment_hash,
            "amount_sat": decoded_invoice.amount_msat / 1000,
            "expires_on": decoded_invoice.expiry,
            "description": decoded_invoice.description,
        }

        return jsonify(resp_data)

    return (
        jsonify(
            {
                "error": "unknown",
            }
        ),
        HTTPStatus.SERVICE_UNAVAILABLE,
    )


@bitclouds_ext.route("/api/v1/server_types", methods=["GET"])
async def get_server_images():
    """
    Grab all server image types from Bitclouds.
    """
    resp = httpx.get("https://bitclouds.sh/images/")
    if not resp.is_error:
        return jsonify(resp.json()["images"])

    return (
        jsonify(
            {
                "error": "unknown",
            }
        ),
        HTTPStatus.SERVICE_UNAVAILABLE,
    )


@bitclouds_ext.route("/api/v1/confirm_server_buy", methods=["POST"])
async def confirm_server_buy():
    """
    Confirm server purchase
    """
    print(await request.get_json())
    return (
        jsonify(
            {
                "error": "unknown",
            }
        ),
        HTTPStatus.SERVICE_UNAVAILABLE,
    )
    """
    if not resp.is_error:
        return jsonify(resp.json()['images'])

    return jsonify({
            'error': 'unknown',
            }), HTTPStatus.SERVICE_UNAVAILABLE
    """
