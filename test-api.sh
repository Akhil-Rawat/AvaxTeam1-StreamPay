#!/bin/bash
echo "Testing StreamPay API..."
echo "========================"
echo ""
echo "Plans endpoint:"
curl -s -w "\nResponse Code: %{http_code}\n" http://localhost:3001/plans
echo ""
echo "Health endpoint:"
curl -s -w "\nResponse Code: %{http_code}\n" http://localhost:3001/health