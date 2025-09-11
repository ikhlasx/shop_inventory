from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
from urllib.parse import quote_plus

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']

# Handle URL encoding for MongoDB connection string if needed
if 'MONGO_USERNAME' in os.environ and 'MONGO_PASSWORD' in os.environ:
    # If username and password are provided separately, construct the URL with proper encoding
    username = quote_plus(os.environ['MONGO_USERNAME'])
    password = quote_plus(os.environ['MONGO_PASSWORD'])
    mongo_host = os.environ.get('MONGO_HOST', 'cluster0.irq0hhv.mongodb.net')
    mongo_options = os.environ.get('MONGO_OPTIONS', '?retryWrites=true&w=majority&appName=Cluster0')
    mongo_url = f"mongodb+srv://{username}:{password}@{mongo_host}/{mongo_options}"

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ProductCategory(str, Enum):
    WOOL = "wool"
    SILK = "silk"
    COTTON = "cotton"
    CASHMERE = "cashmere"
    SYNTHETIC = "synthetic"
    MIXED = "mixed"

class ColorName(str, Enum):
    BLACK = "black"
    WHITE = "white"
    GREY = "grey"
    LIGHT_GREY = "light_grey"
    DARK_GREY = "dark_grey"
    RED = "red"
    LIGHT_RED = "light_red"
    DARK_RED = "dark_red"
    ORANGE = "orange"
    BROWN = "brown"
    YELLOW = "yellow"
    LIGHT_YELLOW = "light_yellow"
    GREEN = "green"
    LIGHT_GREEN = "light_green"
    DARK_GREEN = "dark_green"
    BLUE = "blue"
    LIGHT_BLUE = "light_blue"
    DARK_BLUE = "dark_blue"
    PURPLE = "purple"
    LIGHT_PURPLE = "light_purple"
    DARK_PURPLE = "dark_purple"
    PINK = "pink"
    LIGHT_PINK = "light_pink"
    MAROON = "maroon"
    NAVY = "navy"
    TEAL = "teal"
    OLIVE = "olive"
    BEIGE = "beige"
    CREAM = "cream"

# Models
class Product(BaseModel):
    code: str = Field(..., description="Unique product code")
    name: str
    colorName: ColorName
    colorHex: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    price: float = Field(..., gt=0)
    category: ProductCategory
    stockQty: int = Field(default=0, ge=0)
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    colorName: ColorName
    colorHex: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    price: float = Field(..., gt=0)
    category: ProductCategory
    stockQty: int = Field(default=0, ge=0)
    code: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    colorName: Optional[ColorName] = None
    colorHex: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    price: Optional[float] = Field(None, gt=0)
    category: Optional[ProductCategory] = None
    stockQty: Optional[int] = Field(None, ge=0)

class Sale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    productCode: str
    productName: str
    priceAtSale: float
    colorAtSale: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quantity: int = Field(default=1, gt=0)

class SaleCreate(BaseModel):
    productCode: str
    quantity: int = Field(default=1, gt=0)

class ColorDetection(BaseModel):
    hex: str
    rgb: Dict[str, int]
    hsv: Dict[str, float]
    name: ColorName
    confidence: float

class DashboardStats(BaseModel):
    totalRevenue: Dict[str, float]
    totalUnits: Dict[str, int]
    distinctProducts: Dict[str, int]
    topSellers: List[Dict[str, Any]]

# Helper functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse datetime strings from MongoDB back to datetime objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if key in ['createdAt', 'updatedAt', 'timestamp'] and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

async def generate_product_code():
    """Generate unique product code"""
    count = await db.products.count_documents({})
    return f"SH-{count + 1:04d}"

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    if not product.code:
        product.code = await generate_product_code()
    
    # Check if code already exists
    existing = await db.products.find_one({"code": product.code})
    if existing:
        raise HTTPException(status_code=400, detail="Product code already exists")
    
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    product_dict = prepare_for_mongo(product_obj.dict())
    
    result = await db.products.insert_one(product_dict)
    if result.inserted_id:
        return product_obj
    raise HTTPException(status_code=400, detail="Failed to create product")

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[ProductCategory] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category.value
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"code": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query).to_list(length=None)
    return [Product(**parse_from_mongo(product)) for product in products]

@api_router.get("/products/{product_code}", response_model=Product)
async def get_product(product_code: str):
    product = await db.products.find_one({"code": product_code})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**parse_from_mongo(product))

@api_router.put("/products/{product_code}", response_model=Product)
async def update_product(product_code: str, product_update: ProductUpdate):
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    result = await db.products.update_one(
        {"code": product_code},
        {"$set": prepare_for_mongo(update_data)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"code": product_code})
    return Product(**parse_from_mongo(updated_product))

@api_router.delete("/products/{product_code}")
async def delete_product(product_code: str):
    result = await db.products.delete_one({"code": product_code})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Sales Routes
@api_router.post("/sales", response_model=Sale)
async def create_sale(sale: SaleCreate):
    # Get product details
    product = await db.products.find_one({"code": sale.productCode})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check stock
    if product["stockQty"] < sale.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Create sale record
    sale_obj = Sale(
        productCode=sale.productCode,
        productName=product["name"],
        priceAtSale=product["price"],
        colorAtSale=f"{product['colorName']} ({product['colorHex']})",
        quantity=sale.quantity
    )
    
    sale_dict = prepare_for_mongo(sale_obj.dict())
    
    # Update stock and insert sale in transaction-like operation
    await db.products.update_one(
        {"code": sale.productCode},
        {"$inc": {"stockQty": -sale.quantity}}
    )
    
    result = await db.sales.insert_one(sale_dict)
    if result.inserted_id:
        return sale_obj
    raise HTTPException(status_code=400, detail="Failed to create sale")

@api_router.get("/sales", response_model=List[Sale])
async def get_sales(limit: int = 100, search: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"productName": {"$regex": search, "$options": "i"}},
            {"productCode": {"$regex": search, "$options": "i"}}
        ]
    
    sales = await db.sales.find(query).sort("timestamp", -1).limit(limit).to_list(length=limit)
    return [Sale(**parse_from_mongo(sale)) for sale in sales]

# Dashboard Routes
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    # Calculate date ranges
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Revenue calculations
    today_sales = await db.sales.find({"timestamp": {"$gte": today_start.isoformat()}}).to_list(length=None)
    month_sales = await db.sales.find({"timestamp": {"$gte": month_start.isoformat()}}).to_list(length=None)
    all_sales = await db.sales.find().to_list(length=None)
    
    total_revenue = {
        "today": sum(sale["priceAtSale"] * sale["quantity"] for sale in today_sales),
        "month": sum(sale["priceAtSale"] * sale["quantity"] for sale in month_sales),
        "allTime": sum(sale["priceAtSale"] * sale["quantity"] for sale in all_sales)
    }
    
    total_units = {
        "today": sum(sale["quantity"] for sale in today_sales),
        "month": sum(sale["quantity"] for sale in month_sales),
        "allTime": sum(sale["quantity"] for sale in all_sales)
    }
    
    # Distinct products
    distinct_products = {
        "today": len(set(sale["productCode"] for sale in today_sales)),
        "month": len(set(sale["productCode"] for sale in month_sales)),
        "allTime": len(set(sale["productCode"] for sale in all_sales))
    }
    
    # Top sellers
    product_stats = {}
    for sale in all_sales:
        code = sale["productCode"]
        if code not in product_stats:
            product_stats[code] = {
                "productName": sale["productName"],
                "totalUnits": 0,
                "totalRevenue": 0
            }
        product_stats[code]["totalUnits"] += sale["quantity"]
        product_stats[code]["totalRevenue"] += sale["priceAtSale"] * sale["quantity"]
    
    top_sellers = sorted(
        [{"productCode": code, **stats} for code, stats in product_stats.items()],
        key=lambda x: x["totalRevenue"],
        reverse=True
    )[:10]
    
    return DashboardStats(
        totalRevenue=total_revenue,
        totalUnits=total_units,
        distinctProducts=distinct_products,
        topSellers=top_sellers
    )

# Color Detection Route
@api_router.post("/detect-color", response_model=ColorDetection)
async def detect_color(rgb_data: Dict[str, int]):
    """Detect color name from RGB values"""
    r, g, b = rgb_data["r"], rgb_data["g"], rgb_data["b"]
    
    # Convert RGB to HSV
    r_norm, g_norm, b_norm = r/255.0, g/255.0, b/255.0
    max_val = max(r_norm, g_norm, b_norm)
    min_val = min(r_norm, g_norm, b_norm)
    diff = max_val - min_val
    
    # Calculate HSV
    if diff == 0:
        hue = 0
    elif max_val == r_norm:
        hue = (60 * ((g_norm - b_norm) / diff) + 360) % 360
    elif max_val == g_norm:
        hue = (60 * ((b_norm - r_norm) / diff) + 120) % 360
    else:
        hue = (60 * ((r_norm - g_norm) / diff) + 240) % 360
    
    saturation = 0 if max_val == 0 else diff / max_val
    value = max_val
    
    # Color classification
    hex_color = f"#{r:02x}{g:02x}{b:02x}"
    confidence = 0.8
    
    # Enhanced color detection logic
    if value < 0.15:
        color_name = ColorName.BLACK
    elif saturation < 0.1:
        if value > 0.9:
            color_name = ColorName.WHITE
        elif value > 0.6:
            color_name = ColorName.LIGHT_GREY
        elif value > 0.3:
            color_name = ColorName.GREY
        else:
            color_name = ColorName.DARK_GREY
    else:
        # Color detection based on hue ranges
        if 0 <= hue < 15 or 345 <= hue < 360:
            color_name = ColorName.DARK_RED if value < 0.5 else (ColorName.LIGHT_RED if value > 0.8 and saturation < 0.7 else ColorName.RED)
        elif 15 <= hue < 45:
            color_name = ColorName.ORANGE if saturation > 0.5 else ColorName.BROWN
        elif 45 <= hue < 75:
            color_name = ColorName.LIGHT_YELLOW if value > 0.8 else ColorName.YELLOW
        elif 75 <= hue < 150:
            color_name = ColorName.LIGHT_GREEN if value > 0.7 and saturation < 0.6 else (ColorName.DARK_GREEN if value < 0.4 else ColorName.GREEN)
        elif 150 <= hue < 210:
            color_name = ColorName.LIGHT_BLUE if value > 0.7 and saturation < 0.6 else (ColorName.DARK_BLUE if value < 0.4 else ColorName.BLUE)
        elif 210 <= hue < 270:
            color_name = ColorName.LIGHT_PURPLE if value > 0.7 and saturation < 0.6 else (ColorName.DARK_PURPLE if value < 0.4 else ColorName.PURPLE)
        elif 270 <= hue < 330:
            color_name = ColorName.LIGHT_PINK if value > 0.8 and saturation < 0.5 else ColorName.PINK
        else:
            color_name = ColorName.MAROON if value < 0.4 else ColorName.RED
    
    return ColorDetection(
        hex=hex_color,
        rgb={"r": r, "g": g, "b": b},
        hsv={"h": hue, "s": saturation, "v": value},
        name=color_name,
        confidence=confidence
    )

# Health check
@api_router.get("/")
async def root():
    return {"message": "Shawl Scan & Sales API is running!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()