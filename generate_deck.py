import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # Theme Colors
    DARK_BLUE = RGBColor(15, 23, 42)    # Slate 900
    NAVY_BLUE = RGBColor(23, 59, 102)   # Deep Blue
    INDIGO = RGBColor(79, 70, 229)      # Indigo 600
    AMBER = RGBColor(180, 83, 9)       # Amber 700
    WHITE = RGBColor(255, 255, 255)
    SLATE_GRAY = RGBColor(100, 116, 139)
    LIGHT_BG = RGBColor(248, 250, 252)

    def add_header(slide, title_text, category_text="ARAM HACKATHON PITCH DECK"):
        # Header background banner
        header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(1.2))
        header_box.fill.solid()
        header_box.fill.fore_color.rgb = DARK_BLUE
        header_box.line.color.rgb = DARK_BLUE

        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.8)
        tf.margin_top = Inches(0.2)

        p1 = tf.paragraphs[0]
        p1.text = category_text.upper()
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = RGBColor(129, 140, 248) # Indigo 300

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.size = Pt(24)
        p2.font.bold = True
        p2.font.color.rgb = WHITE

    # ==================== SLIDE 1: Title Slide ====================
    slide1 = prs.slides.add_slide(blank_slide_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BLUE
    bg1.line.color.rgb = DARK_BLUE

    # Title Card Box
    tf1 = slide1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(4.5)).text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "ARAM (அறம்)"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = WHITE

    p = tf1.add_paragraph()
    p.text = "AI-Powered Multilingual Legal Aid Triage & Complaint Management System"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = RGBColor(165, 180, 252)

    p = tf1.add_paragraph()
    p.text = "\nEmpowering low-literacy citizens with voice-first legal aid, ONNX ML classification, and instant advocate routing."
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(203, 213, 225)

    p = tf1.add_paragraph()
    p.text = "\n👥 Team Members: Noyal Ashwin J & Sharon R"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = RGBColor(251, 191, 36)

    # ==================== SLIDE 2: Problem Statement ====================
    slide2 = prs.slides.add_slide(blank_slide_layout)
    add_header(slide2, "1. Problem & Critical Need")

    problems = [
        ("🌐 Language & Literacy Barrier", "Millions of rural citizens face difficulties filing grievances due to language barriers (Tamil script vs Tanglish vs English) and complex legal jargon."),
        ("⏳ Administrative Backlogs", "State & District Legal Aid authorities receive thousands of unclassified complaints, creating heavy manual triage bottlenecks and delayed aid."),
        ("🛡️ Safety & Privacy Vulnerabilities", "Victims of domestic concern or sensitive grievances using shared household phones risk exposure without discreet stealth protection.")
    ]

    left = Inches(0.8)
    for title, desc in problems:
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.6), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = LIGHT_BG
        card.line.color.rgb = RGBColor(226, 232, 240)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.4)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = NAVY_BLUE

        p = tf.add_paragraph()
        p.text = "\n" + desc
        p.font.size = Pt(12)
        p.font.color.rgb = SLATE_GRAY

        left += Inches(4.0)

    # ==================== SLIDE 3: Our Solution ====================
    slide3 = prs.slides.add_slide(blank_slide_layout)
    add_header(slide3, "2. Solution Overview — The ARAM Platform")

    solutions = [
        ("🎙️ Mic-First Voice Entry", "Low-literacy citizens file grievances simply by speaking in Tamil or Tanglish. Whisper STT transcribes speech into normalized text."),
        ("🤖 ONNX AI Triage Engine", "Automated machine learning models categorize grievances into 6 legal sectors, assess priority scores, and recommend authorities."),
        ("🔒 Stealth Privacy Shield", "A single-tap panic button instantly masks sensitive complaint screens into a neutral daily news feed for victim safety.")
    ]

    left = Inches(0.8)
    for title, desc in solutions:
        card = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.6), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(238, 242, 255)
        card.line.color.rgb = RGBColor(199, 210, 254)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.4)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = INDIGO

        p = tf.add_paragraph()
        p.text = "\n" + desc
        p.font.size = Pt(12)
        p.font.color.rgb = SLATE_GRAY

        left += Inches(4.0)

    # ==================== SLIDE 4: Technology Stack ====================
    slide4 = prs.slides.add_slide(blank_slide_layout)
    add_header(slide4, "3. System Architecture & Technical Stack")

    tech_cards = [
        ("📱 Frontend & Mobile", "• React 19 + Vite (PWA)\n• TailwindCSS Design System\n• Capacitor Android Native APK\n• IndexedDB Offline Draft Guard"),
        ("⚡ Java Spring Boot Backend", "• Spring Boot 3.3.5 Microservice\n• AES-GCM-256 PII Encryption\n• Flyway Live Schema Migrations\n• WebSockets & STOMP Protocol"),
        ("🧠 FastAPI AI Microservice", "• ONNX Runtime Inference\n• Faster-Whisper Speech STT\n• Dual-Stage MiniLM Re-Ranking\n• EasyOCR Document Text Masking")
    ]

    left = Inches(0.8)
    for title, desc in tech_cards:
        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.8), Inches(3.6), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = LIGHT_BG
        card.line.color.rgb = RGBColor(203, 213, 225)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.4)

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = NAVY_BLUE

        p = tf.add_paragraph()
        p.text = "\n" + desc
        p.font.size = Pt(12)
        p.font.color.rgb = DARK_BLUE

        left += Inches(4.0)

    # ==================== SLIDE 5: Regional Impact ====================
    slide5 = prs.slides.add_slide(blank_slide_layout)
    add_header(slide5, "4. Business Model & Regional Growth Priorities")

    tf5 = slide5.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.733), Inches(5.2)).text_frame
    tf5.word_wrap = True

    points = [
        ("✅ Regional Development Impact:", "Democratizes legal empowerment across rural and Tier-2/3 districts of Tamil Nadu by eliminating literacy barriers."),
        ("✅ B2G & NGO Target Users:", "Serves District Legal Services Authorities (DLSA), pro-bono law student volunteer networks, and legal aid clinics."),
        ("✅ Paperless & Sustainable Triage:", "Reduces physical administrative paperwork, enabling instant digital case routing to verified legal guides."),
        ("✅ High Scalability:", "Built on production-oriented microservices ready for deployment across state-wide civic tech infrastructures.")
    ]

    for title, body in points:
        p1 = tf5.add_paragraph()
        p1.text = title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = AMBER

        p2 = tf5.add_paragraph()
        p2.text = body + "\n"
        p2.font.size = Pt(13)
        p2.font.color.rgb = DARK_BLUE

    # ==================== SLIDE 6: Team & Roadmap ====================
    slide6 = prs.slides.add_slide(blank_slide_layout)
    add_header(slide6, "5. Team Members & Future Roadmap")

    tf6 = slide6.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.733), Inches(5.2)).text_frame
    tf6.word_wrap = True

    p = tf6.paragraphs[0]
    p.text = "👨‍💻 Co-Creators & Developers"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY_BLUE

    p = tf6.add_paragraph()
    p.text = "• Mr. Noyal Ashwin J — Lead Full-Stack & Systems Developer (noyalashwin0704@gmail.com | +91 6381276381)\n• Mr. Sharon R — Co-Developer & Machine Learning Engineer (+91 8220355021)\n"
    p.font.size = Pt(14)
    p.font.color.rgb = DARK_BLUE

    p = tf6.add_paragraph()
    p.text = "🚀 Future Technical Enhancement Roadmap"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = INDIGO

    p = tf6.add_paragraph()
    p.text = "• IndicTrans2 Neural Translation Pipeline for 100% native Tamil-English cross-script alignment.\n• Advanced OpenCV Document Preprocessing (Image deskewing & noise reduction prior to EasyOCR).\n• Explainable AI (XAI) feature attribution using SHAP for transparent priority scoring.\n• Non-blocking Spring WebFlux WebClient & STOMP WebSockets integration for enterprise scaling."
    p.font.size = Pt(13)
    p.font.color.rgb = DARK_BLUE

    output_filename = "ARAM_Hackathon_Pitch_Deck.pptx"
    prs.save(output_filename)
    print(f"SUCCESSFULLY_CREATED_{output_filename}")

if __name__ == "__main__":
    create_presentation()
