from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.units import inch

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)

from settings_app.models import (
    StoreSettings
)

from reportlab.platypus import Image


def generate_invoice_pdf(
    transaction
):

    buffer = BytesIO()

    pdf = SimpleDocTemplate(
        buffer
    )

    styles = (
        getSampleStyleSheet()
    )

    elements = []

    store = (
        StoreSettings.objects.first()
    )
    if store.logo:

        try:

            logo = Image(
                store.logo.path,
                width=100,
                height=100
            )

            elements.append(
                logo
            )

            elements.append(
                Spacer(
                    1,
                    10
                )
            )

        except Exception as e:

            print(
                "Logo Error:",
                e
            )
    # Shop Name

    Paragraph(
    f"""
    <para align='center'>
    <font size='22'>
    <b>{store.shop_name}</b>
    </font>
    </para>
    """,
    styles["Title"]
)

    elements.append(
        Paragraph(
            store.address,
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Phone: {store.phone}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"GST: {store.gst_number}",
            styles["Normal"]
        )
    )

    elements.append(
        Spacer(
            1,
            20
        )
    )

    # Bill Details

    elements.append(
        Paragraph(
            f"Bill Number: {transaction.bill_number}",
            styles["Heading3"]
        )
    )

    elements.append(
        Paragraph(
            f"Payment: {transaction.payment_method}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"Date: {transaction.created_at.strftime('%d-%m-%Y %H:%M')}",
            styles["Normal"]
        )
    )

    elements.append(
        Spacer(
            1,
            20
        )
    )

    # Product Table

    data = [[
        "Product",
        "Qty",
        "Price",
        "Total"
    ]]

    for item in (
        transaction.items.all()
    ):

        data.append([
            item.product.name,
            item.quantity,
            str(
                item.unit_price
            ),
            str(
                item.subtotal
            )
        ])

    table = Table(data)

    table.setStyle(
    TableStyle([

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#2563EB")
        ),

        (
            "TEXTCOLOR",
            (0, 0),
            (-1, 0),
            colors.white
        ),

        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold"
        ),

        (
            "GRID",
            (0, 0),
            (-1, -1),
            1,
            colors.black
        ),

        (
            "ALIGN",
            (1, 1),
            (-1, -1),
            "CENTER"
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, 0),
            12
        ),

    ])
)

    elements.append(table)

    elements.append(
        Spacer(
            1,
            20
        )
    )

    elements.append(
    Paragraph(
        f"""
        <para align='right'>
        <font size='18'>
        <b>
        Grand Total:
        ₹ {transaction.total_amount}
        </b>
        </font>
        </para>
        """,
        styles["Heading2"]
    )
)

    elements.append(
        Spacer(
            1,
            20
        )
    )

    elements.append(
        Paragraph(
            store.footer_message,
            styles["Italic"]
        )
    )

    pdf.build(elements)

    buffer.seek(0)

    return buffer