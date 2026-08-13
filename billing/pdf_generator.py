from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from settings_app.models import StoreSettings
import requests

def generate_invoice_pdf(transaction):
    buffer = BytesIO()

    # Fixed document sizing with explicit margins to prevent layout overflow
    pdf = SimpleDocTemplate(
        buffer,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    elements = []
    store = StoreSettings.objects.first()

    # --- Typography Definitions ---
    shop_name_style = ParagraphStyle(
        'InvoiceShopName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )

    meta_text_style = ParagraphStyle(
        'InvoiceMetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )

    bill_title_style = ParagraphStyle(
        'InvoiceBillTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#4F46E5') # Core Indigo Accent
    )

    table_header_style = ParagraphStyle(
        'InvoiceTableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'InvoiceTableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    grand_total_style = ParagraphStyle(
        'InvoiceGrandTotal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#F97316'), # Brand Orange Accent
        alignment=2 # Right aligned
    )

    footer_style = ParagraphStyle(
        'InvoiceFooter',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#94A3B8'),
        alignment=1 # Center aligned
    )

    # --- Header Branding Row Layout ---
    header_left = []
    if store:
        header_left.append(Paragraph(store.shop_name, shop_name_style))
        header_left.append(Spacer(1, 4))
        header_left.append(Paragraph(store.address, meta_text_style))
        header_left.append(Spacer(1, 2))
        header_left.append(Paragraph(f"Phone: {store.phone}", meta_text_style))
        if store.gst_number:
            header_left.append(Spacer(1, 2))
            header_left.append(Paragraph(f"GSTIN: {store.gst_number}", meta_text_style))
    else:
        header_left.append(Paragraph("Smart Billing Terminal", shop_name_style))

    header_right = []

    if store and store.logo:

        try:

            response = requests.get(store.logo.url)

            if response.status_code == 200:

                image_buffer = BytesIO(response.content)

                header_right.append(
                    Image(
                        image_buffer,
                        width=64,
                        height=64
                    )
                )

        except Exception as e:

            print("Logo Error:", e)

    # Wrap branding elements in a flat split layout table
    branding_table = Table([[header_left, header_right]], colWidths=[380, 160])
    branding_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    elements.append(branding_table)

    # Thin Elegant Slate Border Divider Separator
    elements.append(Spacer(1, 15))
    divider = Table([[""]], colWidths=[540], rowHeights=[1])
    divider.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), colors.HexColor('#E2E8F0'))]))
    elements.append(divider)
    elements.append(Spacer(1, 15))

   
    
        # --- Bill Metadata Segment Grid ---
    meta_left = [
        Paragraph(
            f"Bill Number: {transaction.bill_number}",
            bill_title_style
        ),
        Spacer(1, 4),
        Paragraph(
            f"Date: {transaction.created_at.strftime('%d-%m-%Y %I:%M %p')}",
            meta_text_style
        )
    ]

    payment_lines = []

    # Old bills with single payment method
    if getattr(transaction, "payment_method", None):

        payment_lines.append(
            f"<b>{transaction.payment_method.upper()}</b> - ₹ {float(transaction.total_amount):,.2f}"
        )

    # New bills with split payments
    elif hasattr(transaction, "payments"):

        for payment in transaction.payments.all():

            payment_lines.append(
                f"<b>{payment.method.upper()}</b> - Rs. {float(payment.amount):,.2f}"
            )

    # Fallback
    if not payment_lines:
        payment_lines.append("N/A")

    payment_html = "<br/>".join(payment_lines)

    meta_right = [
        Paragraph(
            "Payment Details",
            bill_title_style
        ),

        Spacer(1, 4),

        Paragraph(
            payment_html,
            meta_text_style
        )
    ]

    meta_table = Table(
        [[meta_left, meta_right]],
        colWidths=[320, 220]
    )

    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))

    elements.append(meta_table)
    elements.append(Spacer(1, 20))

    

    # --- Product Transactions Ledger Table ---
    data = [[
        Paragraph("Product Item Description", table_header_style),
        Paragraph("Qty", table_header_style),
        Paragraph("Unit Price", table_header_style),
        Paragraph("Subtotal", table_header_style)
    ]]

    for item in transaction.items.all():
        data.append([
            Paragraph(item.product.name, table_cell_style),
            Paragraph(str(item.quantity), table_cell_style),
            Paragraph(f"Rs. {float(item.unit_price):,.2f}", table_cell_style),
            Paragraph(f"Rs. {float(item.subtotal):,.2f}", table_cell_style)
        ])

    # Explicit column tracking widths to eliminate overlapping text fields
    product_table = Table(data, colWidths=[280, 60, 100, 100])
    
    # Modern clean itemised tabular styles
    table_styles = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4F46E5')), # Core Brand Indigo Crown Header
        ('TOPPADDING', (0,0), (-1,0), 8),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'), # Center align metrics columns
        ('ALIGN', (0,0), (0,-1), 'LEFT'),   # Left align description column
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, colors.HexColor('#F1F5F9')), # Clean row lines
    ]

    # Alternating white and slate tint row background styles
    for i in range(1, len(data)):
        if i % 2 == 0:
            table_styles.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')))

    product_table.setStyle(TableStyle(table_styles))
    elements.append(product_table)
    elements.append(Spacer(1, 20))

    # --- Total and Footer Blocks ---
        # ============================================================
    # BILL TOTALS / DISCOUNTS
    # ============================================================

    summary_data = []

    # Original subtotal
    summary_data.append([
        Paragraph(
            "Subtotal",
            table_cell_style
        ),
        Paragraph(
            f"Rs. {float(transaction.subtotal_amount):,.2f}",
            table_cell_style
        )
    ])

    # Product offer
    if (
        transaction.product_discount_amount
        and
        transaction.product_discount_amount > 0
    ):

        offer_name = (
            transaction.product_discount_name
            or "Product Offer"
        )

        summary_data.append([
            Paragraph(
                offer_name,
                table_cell_style
            ),
            Paragraph(
                f"- Rs. {float(transaction.product_discount_amount):,.2f}",
                table_cell_style
            )
        ])

    # Percentage discount
    if (
        transaction.discount_percentage
        and
        transaction.discount_percentage > 0
    ):

        summary_data.append([
            Paragraph(
                f"Additional Discount "
                f"({float(transaction.discount_percentage):.2f}%)",
                table_cell_style
            ),
            Paragraph(
                f"- Rs. {float(transaction.direct_discount_amount):,.2f}",
                table_cell_style
            )
        ])

    # Summary table
    summary_table = Table(
        summary_data,
        colWidths=[380, 160]
    )

    summary_table.setStyle(
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

    elements.append(summary_table)

    elements.append(Spacer(1, 8))

    # Grand total
    elements.append(
        Paragraph(
            f"Grand Total:  Rs. "
            f"{float(transaction.total_amount):,.2f}",
            grand_total_style
        )
    )

    elements.append(Spacer(1, 35))
    elements.append(Spacer(1, 35))

    if store and store.footer_message:
        elements.append(Paragraph(store.footer_message, footer_style))

    # Build Document View
    pdf.build(elements)
    buffer.seek(0)
    return buffer