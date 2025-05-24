#!/bin/bash

# Check if .vercel directory exists
if [ -d ".vercel" ]; then
    # Create the migrations directory in the Vercel functions output
    mkdir -p .vercel/output/functions/__nitro.func/infra/migrations

    # Copy the migrations folder to the Vercel functions directory
    cp -r ./infra/migrations/ .vercel/output/functions/__nitro.func/infra/
fi
