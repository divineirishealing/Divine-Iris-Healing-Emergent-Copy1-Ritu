from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

class Program(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    description: str
    image: str
    link: str = "/program"
    price_usd: float = 0.0
    price_inr: float = 0.0
    price_eur: float = 0.0
    price_gbp: float = 0.0
    price_aed: float = 0.0
    duration: str = "90 days"
    visible: bool = True
    order: int = 0
    program_type: str = "online"  # online / offline / hybrid
    offer_price_usd: float = 0.0
    offer_price_inr: float = 0.0
    offer_text: str = ""
    is_upcoming: bool = False
    start_date: str = ""
    deadline_date: str = ""
    enrollment_open: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProgramCreate(BaseModel):
    title: str
    category: str
    description: str
    image: str
    link: Optional[str] = "/program"
    price_usd: float = 0.0
    price_inr: float = 0.0
    price_eur: float = 0.0
    price_gbp: float = 0.0
    price_aed: float = 0.0
    duration: Optional[str] = "90 days"
    visible: Optional[bool] = True
    order: Optional[int] = 0
    program_type: Optional[str] = "online"
    offer_price_usd: Optional[float] = 0.0
    offer_price_inr: Optional[float] = 0.0
    offer_text: Optional[str] = ""
    is_upcoming: Optional[bool] = False
    start_date: Optional[str] = ""
    deadline_date: Optional[str] = ""
    enrollment_open: Optional[bool] = True

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image: str
    price_usd: float = 0.0
    price_inr: float = 0.0
    price_eur: float = 0.0
    price_gbp: float = 0.0
    price_aed: float = 0.0
    duration: str = "60-90 minutes"
    visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    title: str
    description: str
    image: str
    price_usd: float = 0.0
    price_inr: float = 0.0
    price_eur: float = 0.0
    price_gbp: float = 0.0
    price_aed: float = 0.0
    duration: Optional[str] = "60-90 minutes"
    visible: Optional[bool] = True
    order: Optional[int] = 0

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "graphic"  # "graphic" or "video"
    name: str = ""
    text: str = ""  # searchable text content
    image: str = ""  # graphic image URL
    videoId: str = ""  # YouTube video ID
    thumbnail: str = ""
    program_id: str = ""  # associated program (optional)
    visible: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestimonialCreate(BaseModel):
    type: str = "graphic"
    name: Optional[str] = ""
    text: Optional[str] = ""
    image: Optional[str] = ""
    videoId: Optional[str] = ""
    thumbnail: Optional[str] = ""
    program_id: Optional[str] = ""
    visible: Optional[bool] = True
    order: Optional[int] = 0

class Stat(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    value: str
    label: str
    order: int = 0

class StatCreate(BaseModel):
    value: str
    label: str
    order: Optional[int] = 0

class Newsletter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsletterCreate(BaseModel):
    email: str

class SectionStyle(BaseModel):
    font_family: Optional[str] = None
    font_size: Optional[str] = None
    font_color: Optional[str] = None
    font_style: Optional[str] = None  # normal, italic
    font_weight: Optional[str] = None  # 300, 400, 500, 600, 700
    bg_color: Optional[str] = None
    bg_image: Optional[str] = None

class SiteSettings(BaseModel):
    id: str = "site_settings"
    heading_font: str = "Playfair Display"
    body_font: str = "Lato"
    heading_color: str = "#1a1a1a"
    body_color: str = "#4a4a4a"
    accent_color: str = "#D4AF37"
    heading_size: str = "default"
    body_size: str = "default"
    # Hero section
    hero_video_url: str = ""
    hero_title: str = "Divine Iris\nHealing"
    hero_subtitle: str = "ETERNAL HAPPINESS"
    hero_subtitle_color: str = "#ffffff"
    hero_title_color: str = "#ffffff"
    hero_title_align: str = "left"
    hero_title_bold: bool = False
    hero_title_size: str = "70px"
    hero_title_font: str = "Cinzel"
    hero_title_italic: bool = False
    hero_subtitle_bold: bool = False
    hero_subtitle_size: str = "14px"
    hero_subtitle_font: str = "Lato"
    hero_subtitle_italic: bool = False
    hero_show_lines: bool = True
    # Logo settings
    logo_url: str = ""
    logo_width: int = 96
    # About section
    about_subtitle: str = "Meet the Healer"
    about_name: str = "Dimple Ranawat"
    about_title: str = "Founder, Divine Iris – Soulful Healing Studio"
    about_bio: str = "Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being."
    about_bio_2: str = "Dimple's journey began with a profound question: \"Why do people continue to suffer despite awareness, effort, and access to solutions?\" Her work is rooted in lived experience and deep inquiry."
    about_image: str = ""
    about_button_text: str = "Read Full Bio"
    about_button_link: str = "/#about"
    # Newsletter section
    newsletter_heading: str = "Join Our Community"
    newsletter_description: str = "Sign up to receive updates on upcoming workshops, new courses and more information"
    newsletter_button_text: str = "Subscribe"
    newsletter_footer_text: str = "By subscribing, you agree to our Privacy Policy and Terms of Use."
    # Footer section
    footer_brand_name: str = "Divine Iris Healing"
    footer_tagline: str = "Delve into the deeper realm of your soul with Divine Iris – Soulful Healing Studio"
    footer_email: str = "support@divineirishealing.com"
    footer_phone: str = "+971553325778"
    footer_copyright: str = "2026 Divine Iris Healing. All Rights Reserved."
    # Social links
    social_facebook: str = "https://facebook.com"
    social_instagram: str = "https://instagram.com"
    social_youtube: str = "https://youtube.com"
    social_linkedin: str = "https://linkedin.com"
    # Per-section styles
    sections: Optional[Dict] = {}

class SiteSettingsUpdate(BaseModel):
    heading_font: Optional[str] = None
    body_font: Optional[str] = None
    heading_color: Optional[str] = None
    body_color: Optional[str] = None
    accent_color: Optional[str] = None
    heading_size: Optional[str] = None
    body_size: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_subtitle_color: Optional[str] = None
    hero_title_color: Optional[str] = None
    hero_title_align: Optional[str] = None
    hero_title_bold: Optional[bool] = None
    hero_title_size: Optional[str] = None
    hero_title_font: Optional[str] = None
    hero_title_italic: Optional[bool] = None
    hero_subtitle_bold: Optional[bool] = None
    hero_subtitle_size: Optional[str] = None
    hero_subtitle_font: Optional[str] = None
    hero_subtitle_italic: Optional[bool] = None
    hero_show_lines: Optional[bool] = None
    logo_url: Optional[str] = None
    logo_width: Optional[int] = None
    about_subtitle: Optional[str] = None
    about_name: Optional[str] = None
    about_title: Optional[str] = None
    about_bio: Optional[str] = None
    about_bio_2: Optional[str] = None
    about_image: Optional[str] = None
    about_button_text: Optional[str] = None
    about_button_link: Optional[str] = None
    newsletter_heading: Optional[str] = None
    newsletter_description: Optional[str] = None
    newsletter_button_text: Optional[str] = None
    newsletter_footer_text: Optional[str] = None
    footer_brand_name: Optional[str] = None
    footer_tagline: Optional[str] = None
    footer_email: Optional[str] = None
    footer_phone: Optional[str] = None
    footer_copyright: Optional[str] = None
    social_facebook: Optional[str] = None
    social_instagram: Optional[str] = None
    social_youtube: Optional[str] = None
    social_linkedin: Optional[str] = None
    sections: Optional[Dict] = None

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    customer_email: EmailStr
    customer_name: Optional[str] = None
    item_type: str
    item_id: str
    item_title: str
    amount: float
    currency: str
    payment_status: str = "pending"
    stripe_payment_intent: Optional[str] = None
    metadata: Optional[Dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentTransactionCreate(BaseModel):
    session_id: str
    customer_email: EmailStr
    customer_name: Optional[str] = None
    item_type: str
    item_id: str
    item_title: str
    amount: float
    currency: str
    metadata: Optional[Dict] = None

class CheckoutRequest(BaseModel):
    item_type: str
    item_id: str
    currency: str = "usd"
    customer_email: EmailStr
    customer_name: Optional[str] = None
    origin_url: str

class CurrencyInfo(BaseModel):
    currency: str
    symbol: str
    country: str
