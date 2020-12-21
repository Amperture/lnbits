from quart import g, render_template

from lnbits.decorators import check_user_exists, validate_uuids

from . import bitclouds_ext


@bitclouds_ext.route("/")
@validate_uuids(["usr"], required=True)
@check_user_exists()
async def index():
    return await render_template("bitclouds/index.html", user=g.user)
