from io import BytesIO
from decimal import Decimal, ROUND_HALF_UP

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    HRFlowable,
)

from django.utils import timezone

from settings_app.models import StoreSettings

import requests


def generate_invoice_pdf(transaction):

    buffer = BytesIO()

    # ============================================================
    # PAGE SETUP
    # ============================================================

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=A4,

        rightMargin=18 * mm,
        leftMargin=18 * mm,

        topMargin=16 * mm,
        bottomMargin=16 * mm,

        title=f"Invoice {transaction.bill_number}",
        author="NexBill",
    )

    styles = getSampleStyleSheet()

    elements = []

    store = StoreSettings.objects.first()


    # ============================================================
    # COLORS
    # ============================================================

    NAVY = colors.HexColor("#172033")
    DARK = colors.HexColor("#1E293B")
    SLATE = colors.HexColor("#64748B")
    LIGHT_SLATE = colors.HexColor("#94A3B8")

    BORDER = colors.HexColor("#E2E8F0")
    LIGHT_BG = colors.HexColor("#F8FAFC")
    WHITE = colors.white

    GREEN = colors.HexColor("#15803D")
    GREEN_BG = colors.HexColor("#F0FDF4")
    GREEN_BORDER = colors.HexColor("#BBF7D0")

    ORANGE = colors.HexColor("#F97316")
    INDIGO = colors.HexColor("#4F46E5")
    INDIGO_BG = colors.HexColor("#EEF2FF")
    INDIGO_BORDER = colors.HexColor("#C7D2FE")


    # ============================================================
    # ROUND FINAL TOTAL
    # ============================================================

    rounded_total = Decimal(
        str(transaction.total_amount)
    ).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP
    )


    # ============================================================
    # CORRECT LOCAL DATE / TIME
    # ============================================================

    transaction_datetime = transaction.created_at

    if timezone.is_aware(transaction_datetime):

        transaction_datetime = timezone.localtime(
            transaction_datetime
        )

    invoice_date = transaction_datetime.strftime(
        "%d %b %Y"
    )

    invoice_time = transaction_datetime.strftime(
        "%I:%M %p"
    )


    # ============================================================
    # STYLES
    # ============================================================

    shop_name_style = ParagraphStyle(
        "ShopName",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=19,
        leading=22,

        textColor=NAVY,
    )


    invoice_heading_style = ParagraphStyle(
        "InvoiceHeading",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,

        textColor=NAVY,

        alignment=TA_RIGHT,
    )


    small_label_style = ParagraphStyle(
        "SmallLabel",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9,

        textColor=LIGHT_SLATE,
    )


    normal_style = ParagraphStyle(
        "NormalInvoice",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=9.5,
        leading=13,

        textColor=DARK,
    )


    muted_style = ParagraphStyle(
        "Muted",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=8.5,
        leading=11,

        textColor=SLATE,
    )


    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,

        textColor=WHITE,
    )


    table_text_style = ParagraphStyle(
        "TableText",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=8.5,
        leading=12,

        textColor=DARK,
    )


    table_text_right_style = ParagraphStyle(
        "TableTextRight",
        parent=table_text_style,

        alignment=TA_RIGHT,
    )


    discount_style = ParagraphStyle(
        "DiscountStyle",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=9,

        leading=12,

        textColor=GREEN,
    )


    discount_small_style = ParagraphStyle(
        "DiscountSmallStyle",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=7.5,

        leading=10,

        textColor=SLATE,
    )


    total_label_style = ParagraphStyle(
        "TotalLabel",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=10,

        textColor=NAVY,
    )


    grand_total_style = ParagraphStyle(
        "GrandTotal",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=17,
        leading=21,

        textColor=NAVY,

        alignment=TA_RIGHT,
    )


    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=8,

        leading=12,

        textColor=SLATE,

        alignment=TA_CENTER,
    )


    marketing_title_style = ParagraphStyle(
        "MarketingTitle",
        parent=styles["Normal"],

        fontName="Helvetica-Bold",
        fontSize=10,

        leading=13,

        textColor=NAVY,

        alignment=TA_CENTER,
    )


    marketing_text_style = ParagraphStyle(
        "MarketingText",
        parent=styles["Normal"],

        fontName="Helvetica",
        fontSize=8,

        leading=11,

        textColor=SLATE,

        alignment=TA_CENTER,
    )


    # ============================================================
    # STORE INFORMATION
    # ============================================================

    if store:

        shop_name = store.shop_name or "NexBill"

        address = store.address or ""

        phone = store.phone or ""

        gst_number = store.gst_number or ""

    else:

        shop_name = "NexBill"

        address = ""

        phone = ""

        gst_number = ""


    # ============================================================
    # LOGO
    # ============================================================

    logo_image = None

    if store and store.logo:

        try:

            response = requests.get(
                store.logo.url,
                timeout=5
            )

            if response.status_code == 200:

                logo_buffer = BytesIO(
                    response.content
                )

                logo_image = Image(
                    logo_buffer,

                    width=20 * mm,
                    height=20 * mm,

                    kind="proportional"
                )

        except Exception as error:

            print(
                "Invoice logo error:",
                error
            )


    # ============================================================
    # BUSINESS HEADER
    # ============================================================

    business_details = []

    business_details.append(
        Paragraph(
            shop_name,
            shop_name_style
        )
    )


    if address:

        business_details.append(
            Spacer(1, 2)
        )

        business_details.append(
            Paragraph(
                address,
                muted_style
            )
        )


    if phone:

        business_details.append(
            Paragraph(
                f"Phone: {phone}",
                muted_style
            )
        )


    if gst_number:

        business_details.append(
            Paragraph(
                f"GSTIN: {gst_number}",
                muted_style
            )
        )


    # ============================================================
    # INVOICE INFORMATION
    # ============================================================

    invoice_details = []

    invoice_details.append(
        Paragraph(
            "INVOICE",
            invoice_heading_style
        )
    )


    invoice_details.append(
        Spacer(1, 3)
    )


    invoice_details.append(
        Paragraph(
            f"<b>Invoice No:</b> "
            f"{transaction.bill_number}",
            muted_style
        )
    )


    invoice_details.append(
        Paragraph(
            f"<b>Date:</b> "
            f"{invoice_date}",
            muted_style
        )
    )


    invoice_details.append(
        Paragraph(
            f"<b>Time:</b> "
            f"{invoice_time}",
            muted_style
        )
    )


    # ============================================================
    # HEADER LAYOUT
    # ============================================================

    if logo_image:

        left_header = Table(
            [
                [
                    logo_image,
                    business_details
                ]
            ],

            colWidths=[
                24 * mm,
                92 * mm
            ]
        )


        left_header.setStyle(
            TableStyle([

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),

                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    0
                ),

                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    0
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    0
                ),

            ])
        )

    else:

        left_header = business_details


    header_table = Table(
        [
            [
                left_header,
                invoice_details
            ]
        ],

        colWidths=[
            112 * mm,
            62 * mm
        ]
    )


    header_table.setStyle(
        TableStyle([

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),

            (
                "ALIGN",
                (1, 0),
                (1, 0),
                "RIGHT"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

        ])
    )


    elements.append(
        header_table
    )


    elements.append(
        Spacer(1, 7 * mm)
    )


    # ============================================================
    # DIVIDER
    # ============================================================

    elements.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=BORDER,

            spaceBefore=0,
            spaceAfter=0,
        )
    )


    elements.append(
        Spacer(1, 5 * mm)
    )


    # ============================================================
    # CUSTOMER
    # ============================================================

    customer = getattr(
        transaction,
        "customer",
        None
    )


    if customer:

        customer_name = (
            customer.name
            or "Walk-in Customer"
        )

        customer_phone = (
            customer.phone_number
            or "—"
        )

    else:

        customer_name = "Walk-in Customer"

        customer_phone = "—"


    # ============================================================
    # PAYMENT
    # ============================================================

    payment_lines = []


    # Normal single payment

    if getattr(
        transaction,
        "payment_method",
        None
    ):

        payment_lines.append(
            transaction.payment_method.upper()
        )


    # Split payment

    elif hasattr(
        transaction,
        "payments"
    ):

        for payment in transaction.payments.all():

            payment_lines.append(
                f"{payment.method.upper()} "
                f"Rs. {float(payment.amount):,.2f}"
            )


    if not payment_lines:

        payment_lines.append(
            "N/A"
        )


    payment_text = "<br/>".join(
        payment_lines
    )


    # ============================================================
    # COMPACT CUSTOMER / PAYMENT BOX
    # ============================================================

    customer_box = Table(

        [

            [
                Paragraph(
                    "BILL TO",
                    small_label_style
                ),

                Paragraph(
                    "PAYMENT",
                    small_label_style
                ),
            ],

            [
                Paragraph(
                    f"<b>{customer_name}</b>",
                    normal_style
                ),

                Paragraph(
                    payment_text,
                    normal_style
                ),
            ],

            [
                Paragraph(
                    f"Phone: {customer_phone}",
                    muted_style
                ),

                Paragraph(
                    "Status: "
                    "<b>PAID</b>",
                    muted_style
                ),
            ]

        ],

        colWidths=[
            87 * mm,
            87 * mm
        ]
    )


    customer_box.setStyle(
        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                LIGHT_BG
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.6,
                BORDER
            ),

            (
                "INNERGRID",
                (0, 0),
                (-1, -1),
                0.4,
                BORDER
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                5
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                5
            ),

        ])
    )


    elements.append(
        customer_box
    )


    elements.append(
        Spacer(1, 6 * mm)
    )


    # ============================================================
    # ITEMS TABLE
    # ============================================================

    item_data = [

        [

            Paragraph(
                "DESCRIPTION",
                table_header_style
            ),

            Paragraph(
                "QTY",
                table_header_style
            ),

            Paragraph(
                "UNIT PRICE",
                table_header_style
            ),

            Paragraph(
                "AMOUNT",
                table_header_style
            ),

        ]

    ]


    for item in transaction.items.all():

        item_data.append(

            [

                Paragraph(
                    item.product.name,
                    table_text_style
                ),

                Paragraph(
                    str(item.quantity),
                    table_text_right_style
                ),

                Paragraph(
                    f"Rs. "
                    f"{float(item.unit_price):,.2f}",
                    table_text_right_style
                ),

                Paragraph(
                    f"Rs. "
                    f"{float(item.subtotal):,.2f}",
                    table_text_right_style
                ),

            ]

        )


    item_table = Table(

        item_data,

        colWidths=[
            83 * mm,
            20 * mm,
            35 * mm,
            36 * mm
        ],

        repeatRows=1
    )


    item_table_styles = [

        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            NAVY
        ),

        (
            "VALIGN",
            (0, 0),
            (-1, -1),
            "MIDDLE"
        ),

        (
            "ALIGN",
            (1, 0),
            (-1, -1),
            "RIGHT"
        ),

        (
            "ALIGN",
            (0, 0),
            (0, -1),
            "LEFT"
        ),

        (
            "TOPPADDING",
            (0, 0),
            (-1, 0),
            8
        ),

        (
            "BOTTOMPADDING",
            (0, 0),
            (-1, 0),
            8
        ),

        (
            "TOPPADDING",
            (0, 1),
            (-1, -1),
            7
        ),

        (
            "BOTTOMPADDING",
            (0, 1),
            (-1, -1),
            7
        ),

        (
            "LINEBELOW",
            (0, 1),
            (-1, -1),
            0.5,
            BORDER
        ),

        (
            "BOX",
            (0, 0),
            (-1, -1),
            0.7,
            BORDER
        ),

    ]


    # Alternating rows

    for row in range(
        1,
        len(item_data)
    ):

        if row % 2 == 0:

            item_table_styles.append(

                (
                    "BACKGROUND",
                    (0, row),
                    (-1, row),
                    LIGHT_BG
                )

            )


    item_table.setStyle(
        TableStyle(
            item_table_styles
        )
    )


    elements.append(
        item_table
    )


    elements.append(
        Spacer(1, 6 * mm)
    )


    # ============================================================
    # BILL SUMMARY
    # ============================================================

    summary_rows = []


    # ------------------------------------------------------------
    # SUBTOTAL
    # ------------------------------------------------------------

    subtotal_amount = Decimal(
        str(
            getattr(
                transaction,
                "subtotal_amount",
                0
            )
            or 0
        )
    )


    summary_rows.append(

        [

            Paragraph(
                "Subtotal",
                normal_style
            ),

            Paragraph(
                f"Rs. "
                f"{float(subtotal_amount):,.2f}",
                table_text_right_style
            )

        ]

    )


    # ============================================================
    # PRODUCT DISCOUNT / BUY X GET Y
    # ============================================================

    product_discount = getattr(
        transaction,
        "product_discount",
        None
    )


    product_discount_amount = Decimal(
        str(
            getattr(
                transaction,
                "product_discount_amount",
                0
            )
            or 0
        )
    )


    product_discount_name = (
        getattr(
            transaction,
            "product_discount_name",
            None
        )
        or ""
    ).strip()


    if product_discount:

        buy_quantity = int(
            getattr(
                product_discount,
                "buy_quantity",
                0
            )
            or 0
        )


        free_quantity = int(
            getattr(
                product_discount,
                "free_quantity",
                0
            )
            or 0
        )


        # --------------------------------------------------------
        # BUILD BOGO DESCRIPTION
        # --------------------------------------------------------

        if (
            buy_quantity > 0
            and
            free_quantity > 0
        ):

            promotion_text = (
                f"Buy {buy_quantity} "
                f"Get {free_quantity} Free"
            )

        else:

            promotion_text = (
                "Product Offer"
            )


        # --------------------------------------------------------
        # PRODUCT NAME
        # --------------------------------------------------------

        discount_product = getattr(
            product_discount,
            "product",
            None
        )


        if discount_product:

            product_name = (
                getattr(
                    discount_product,
                    "name",
                    ""
                )
                or ""
            ).strip()

        else:

            product_name = ""


        # --------------------------------------------------------
        # FINAL DISPLAY NAME
        # --------------------------------------------------------

        if product_discount_name:

            if product_name:

                discount_description = (
                    f"<b>{product_discount_name}</b>"
                    f"<br/>"
                    f"<font size='7.5' color='#64748B'>"
                    f"{promotion_text} on "
                    f"{product_name}"
                    f"</font>"
                )

            else:

                discount_description = (
                    f"<b>{product_discount_name}</b>"
                    f"<br/>"
                    f"<font size='7.5' color='#64748B'>"
                    f"{promotion_text}"
                    f"</font>"
                )

        else:

            discount_description = (
                f"<b>{promotion_text}</b>"
            )


        # --------------------------------------------------------
        # ALWAYS SHOW PRODUCT PROMOTION
        # --------------------------------------------------------

        summary_rows.append(

            [

                Paragraph(
                    discount_description,
                    discount_style
                ),

                Paragraph(
                    f"- Rs. "
                    f"{float(product_discount_amount):,.2f}",
                    table_text_right_style
                )

            ]

        )


    elif product_discount_name:

        # --------------------------------------------------------
        # FALLBACK
        # --------------------------------------------------------
        # This handles older transactions where the FK might not
        # be available but the name was stored on Transaction.
        # --------------------------------------------------------

        summary_rows.append(

            [

                Paragraph(
                    f"<b>{product_discount_name}</b>",
                    discount_style
                ),

                Paragraph(
                    f"- Rs. "
                    f"{float(product_discount_amount):,.2f}",
                    table_text_right_style
                )

            ]

        )


    elif product_discount_amount > 0:

        summary_rows.append(

            [

                Paragraph(
                    "Product Discount",
                    discount_style
                ),

                Paragraph(
                    f"- Rs. "
                    f"{float(product_discount_amount):,.2f}",
                    table_text_right_style
                )

            ]

        )


    # ============================================================
    # ADDITIONAL PERCENTAGE DISCOUNT
    # ============================================================

    discount_percentage = Decimal(
        str(
            getattr(
                transaction,
                "discount_percentage",
                0
            )
            or 0
        )
    )


    direct_discount_amount = Decimal(
        str(
            getattr(
                transaction,
                "direct_discount_amount",
                0
            )
            or 0
        )
    )


    if (
        discount_percentage > 0
        and
        direct_discount_amount > 0
    ):

        summary_rows.append(

            [

                Paragraph(
                    f"Additional Discount "
                    f"({float(discount_percentage):.2f}%)",
                    discount_style
                ),

                Paragraph(
                    f"- Rs. "
                    f"{float(direct_discount_amount):,.2f}",
                    table_text_right_style
                )

            ]

        )


    # ============================================================
    # DISCOUNT TOTAL
    # ============================================================

    total_discount_amount = (
        product_discount_amount
        +
        direct_discount_amount
    )


    if total_discount_amount > 0:

        summary_rows.append(

            [

                Paragraph(
                    "<b>Total Discount</b>",
                    discount_style
                ),

                Paragraph(
                    f"<b>- Rs. "
                    f"{float(total_discount_amount):,.2f}</b>",
                    table_text_right_style
                )

            ]

        )


    # ============================================================
    # DISCOUNT SECTION TABLE
    # ============================================================

    totals_table = Table(

        summary_rows,

        colWidths=[
            110 * mm,
            64 * mm
        ]
    )


    totals_table.setStyle(

        TableStyle([

            (
                "ALIGN",
                (1, 0),
                (1, -1),
                "RIGHT"
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                4
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                4
            ),

            (
                "LINEBELOW",
                (0, 0),
                (-1, -2),
                0.3,
                BORDER
            ),

        ])

    )


    # ============================================================
    # DISCOUNT SECTION HEADER
    # ============================================================

    discount_header = Table(

        [

            [

                Paragraph(
                    "BILL SUMMARY",
                    small_label_style
                ),

                Paragraph(
                    "AMOUNT",
                    small_label_style
                )

            ]

        ],

        colWidths=[
            110 * mm,
            64 * mm
        ]

    )


    discount_header.setStyle(

        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                LIGHT_BG
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.5,
                BORDER
            ),

            (
                "ALIGN",
                (1, 0),
                (1, 0),
                "RIGHT"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                8
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

        ])

    )


    # ============================================================
    # ADD SUMMARY FIRST
    # ============================================================

    elements.append(
        discount_header
    )

    elements.append(
        totals_table
    )


    elements.append(
        Spacer(1, 3 * mm)
    )


    # ============================================================
    # GRAND TOTAL
    # ============================================================

    grand_total_box = Table(

        [

            [

                Paragraph(
                    "TOTAL PAYABLE",
                    total_label_style
                ),

                Paragraph(
                    f"Rs. "
                    f"{rounded_total:,.0f}",
                    grand_total_style
                )

            ]

        ],

        colWidths=[
            85 * mm,
            89 * mm
        ]

    )


    grand_total_box.setStyle(

        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                LIGHT_BG
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                1,
                BORDER
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "ALIGN",
                (1, 0),
                (1, 0),
                "RIGHT"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                12
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                12
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                9
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                9
            ),

        ])

    )


    elements.append(
        grand_total_box
    )


    # ============================================================
    # PAYMENT AMOUNT
    # ============================================================

    elements.append(
        Spacer(1, 4 * mm)
    )


    elements.append(

        Paragraph(

            f"<b>Amount Paid:</b> "
            f"Rs. {rounded_total:,.0f}",

            muted_style

        )

    )


    # ============================================================
    # NEXBILL MARKETING SECTION
    # ============================================================

    elements.append(
        Spacer(1, 10 * mm)
    )


    marketing_box = Table(

        [

            [

                Paragraph(
                    "Thank you for visiting us! ❤️",
                    marketing_title_style
                )

            ],

            [

                Paragraph(
                    "Keep visiting us for our latest "
                    "offers, special deals and new products.",
                    marketing_text_style
                )

            ],

            [

                Paragraph(
                    "Powered by "
                    "<b>NexBill</b>",
                    marketing_text_style
                )

            ]

        ],

        colWidths=[
            174 * mm
        ]

    )


    marketing_box.setStyle(

        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                INDIGO_BG
            ),

            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.7,
                INDIGO_BORDER
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                12
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                12
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

        ])

    )


    elements.append(
        marketing_box
    )


    # ============================================================
    # FOOTER
    # ============================================================

    elements.append(
        Spacer(1, 6 * mm)
    )


    elements.append(

        HRFlowable(

            width="100%",

            thickness=0.7,

            color=BORDER,

            spaceBefore=0,

            spaceAfter=4 * mm,

        )

    )


    footer_message = (

        store.footer_message

        if store and store.footer_message

        else "Thank you for your business."

    )


    footer_content = Table(

        [

            [

                Paragraph(
                    footer_message,
                    footer_style
                ),

                Paragraph(
                    "NexBill Digital Invoice",
                    footer_style
                )

            ]

        ],

        colWidths=[
            120 * mm,
            54 * mm
        ]

    )


    footer_content.setStyle(

        TableStyle([

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),

            (
                "ALIGN",
                (0, 0),
                (0, 0),
                "LEFT"
            ),

            (
                "ALIGN",
                (1, 0),
                (1, 0),
                "RIGHT"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                0
            ),

        ])

    )


    elements.append(
        footer_content
    )


    # ============================================================
    # BUILD PDF
    # ============================================================

    pdf.build(
        elements
    )


    buffer.seek(0)

    return buffer