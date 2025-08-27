import requests
import sys
import json
from datetime import datetime

class ShawlScanAPITester:
    def __init__(self, base_url="https://fabrictrack.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_products = []
        self.created_sales = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if method == 'GET' and endpoint == '':
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test("Health Check", "GET", "", 200)
        return success

    def test_create_product(self, name, color_name, color_hex, price, category, stock_qty=10):
        """Test product creation"""
        product_data = {
            "name": name,
            "colorName": color_name,
            "colorHex": color_hex,
            "price": price,
            "category": category,
            "stockQty": stock_qty
        }
        
        success, response = self.run_test(
            f"Create Product: {name}",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        if success and 'code' in response:
            self.created_products.append(response['code'])
            print(f"   Created product with code: {response['code']}")
            return response['code']
        return None

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success:
            print(f"   Found {len(response)} products")
        return success, response

    def test_get_product_by_code(self, product_code):
        """Test getting a specific product"""
        success, response = self.run_test(
            f"Get Product: {product_code}",
            "GET",
            f"products/{product_code}",
            200
        )
        return success, response

    def test_search_products(self, search_term):
        """Test product search"""
        success, response = self.run_test(
            f"Search Products: {search_term}",
            "GET",
            "products",
            200,
            params={"search": search_term}
        )
        return success, response

    def test_filter_products_by_category(self, category):
        """Test product filtering by category"""
        success, response = self.run_test(
            f"Filter Products by Category: {category}",
            "GET",
            "products",
            200,
            params={"category": category}
        )
        return success, response

    def test_create_sale(self, product_code, quantity=1):
        """Test sale creation"""
        sale_data = {
            "productCode": product_code,
            "quantity": quantity
        }
        
        success, response = self.run_test(
            f"Create Sale for Product: {product_code}",
            "POST",
            "sales",
            200,
            data=sale_data
        )
        
        if success and 'id' in response:
            self.created_sales.append(response['id'])
            print(f"   Created sale with ID: {response['id']}")
        return success, response

    def test_get_sales(self):
        """Test getting sales history"""
        success, response = self.run_test("Get Sales History", "GET", "sales", 200)
        if success:
            print(f"   Found {len(response)} sales")
        return success, response

    def test_color_detection(self, r, g, b):
        """Test color detection"""
        color_data = {"r": r, "g": g, "b": b}
        
        success, response = self.run_test(
            f"Color Detection: RGB({r},{g},{b})",
            "POST",
            "detect-color",
            200,
            data=color_data
        )
        
        if success:
            print(f"   Detected color: {response.get('name')} ({response.get('hex')})")
            print(f"   HSV: {response.get('hsv')}")
        return success, response

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test("Dashboard Statistics", "GET", "dashboard/stats", 200)
        if success:
            print(f"   Total Revenue: {response.get('totalRevenue')}")
            print(f"   Total Units: {response.get('totalUnits')}")
            print(f"   Distinct Products: {response.get('distinctProducts')}")
            print(f"   Top Sellers: {len(response.get('topSellers', []))} products")
        return success, response

    def test_error_cases(self):
        """Test error handling"""
        print("\n🔍 Testing Error Cases...")
        
        # Test getting non-existent product
        success, _ = self.run_test(
            "Get Non-existent Product",
            "GET",
            "products/INVALID-CODE",
            404
        )
        
        # Test creating sale for non-existent product
        success, _ = self.run_test(
            "Create Sale for Non-existent Product",
            "POST",
            "sales",
            404,
            data={"productCode": "INVALID-CODE", "quantity": 1}
        )
        
        # Test invalid color detection data
        success, _ = self.run_test(
            "Invalid Color Detection",
            "POST",
            "detect-color",
            422,
            data={"r": 300, "g": -10, "b": "invalid"}
        )

def main():
    print("🚀 Starting Shawl Scan & Sales API Tests")
    print("=" * 50)
    
    tester = ShawlScanAPITester()
    
    # Test 1: Health Check
    if not tester.test_health_check():
        print("❌ API is not responding, stopping tests")
        return 1

    # Test 2: Color Detection
    print("\n📊 Testing Color Detection...")
    tester.test_color_detection(255, 0, 0)  # Red
    tester.test_color_detection(0, 255, 0)  # Green
    tester.test_color_detection(0, 0, 255)  # Blue
    tester.test_color_detection(255, 255, 255)  # White
    tester.test_color_detection(0, 0, 0)  # Black

    # Test 3: Product Management
    print("\n📦 Testing Product Management...")
    
    # Create test products
    product1_code = tester.test_create_product(
        "Kashmiri Wool Shawl", "red", "#FF0000", 299.99, "wool", 15
    )
    product2_code = tester.test_create_product(
        "Silk Pashmina", "blue", "#0000FF", 599.99, "silk", 8
    )
    product3_code = tester.test_create_product(
        "Cotton Summer Shawl", "green", "#00FF00", 99.99, "cotton", 25
    )

    if not any([product1_code, product2_code, product3_code]):
        print("❌ Failed to create any products, stopping tests")
        return 1

    # Test getting products
    tester.test_get_products()
    
    # Test getting specific products
    if product1_code:
        tester.test_get_product_by_code(product1_code)
    
    # Test search functionality
    tester.test_search_products("Wool")
    tester.test_search_products("Silk")
    
    # Test category filtering
    tester.test_filter_products_by_category("wool")
    tester.test_filter_products_by_category("silk")

    # Test 4: Sales Management
    print("\n💰 Testing Sales Management...")
    
    # Create sales for existing products
    if product1_code:
        tester.test_create_sale(product1_code, 2)
    if product2_code:
        tester.test_create_sale(product2_code, 1)
    if product3_code:
        tester.test_create_sale(product3_code, 3)

    # Get sales history
    tester.test_get_sales()

    # Test 5: Dashboard Statistics
    print("\n📈 Testing Dashboard...")
    tester.test_dashboard_stats()

    # Test 6: Error Cases
    tester.test_error_cases()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.created_products:
        print(f"✅ Created products: {', '.join(tester.created_products)}")
    if tester.created_sales:
        print(f"✅ Created sales: {len(tester.created_sales)} sales records")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API tests mostly successful!")
        return 0
    else:
        print("⚠️  Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())