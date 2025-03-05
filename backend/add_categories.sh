#!/bin/bash

# Your API endpoint - change this to your actual endpoint
API_URL="http://localhost:3000"

# Array of category names
categories=(
  "Healthcare"
  "Education"
  "Food & Grocery"
  "Transportation"
  "Utilities" 
  "Financial Services"
  "Emergency Services"
  "Telecommunications"
  "Childcare"
  "Housing & Shelter"
  "Government Services"
  "Legal Aid"
  "Mental Health"
  "Pharmacy"
  "Community Support"
)

# Function to add a category
add_category() {
  category_name=$1
  echo "Adding category: $category_name"
  
  response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$category_name\"}" \
    $API_URL/categories)
  
  echo "Response: $response"
  echo "----------------------------------------"
}

echo "Starting category creation..."
echo "----------------------------------------"

# Add each category
for category in "${categories[@]}"; do
  add_category "$category"
  # Small delay to prevent overwhelming the API
  sleep 0.5
done

echo "All categories have been processed!"



# # API endpoint
# API_URL="http://localhost:3000"

# echo "Fetching all categories from $API_URL/categories..."
# echo "----------------------------------------"

# # Make the API request
# response=$(curl -s -X GET $API_URL/categories)

# # Check if curl request was successful
# if [ $? -ne 0 ]; then
#   echo "Error: Failed to connect to $API_URL/categories"
#   exit 1
# fi

# # Check if we got a valid response
# if [ -z "$response" ]; then
#   echo "Error: Received empty response"
#   exit 1
# fi

# # Try to format with jq if available
# if command -v jq &> /dev/null; then
#   echo "$response" | jq '.'
# else
#   # Fallback to pretty-printing with Python if available
#   if command -v python3 &> /dev/null; then
#     echo "$response" | python3 -m json.tool
#   elif command -v python &> /dev/null; then
#     echo "$response" | python -m json.tool
#   else
#     # Just output raw response if neither jq nor Python is available
#     echo "$response"
#   fi
# fi

# echo "----------------------------------------"
# echo "Done!"