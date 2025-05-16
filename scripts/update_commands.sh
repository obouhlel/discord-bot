#!/bin/bash

set -e

curl -X PUT http://localhost:3000/commands/update
echo