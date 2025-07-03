#!/bin/bash
cd /home/kavia/workspace/code-generation/reactflask-uienhancer-10316-99b5e02d/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

