# useMetadata Doc

Provides authentication state and app metadata globally.

## Properties:

- **user:** Current user object.
- **isLoading:** Auth loading status.
- **logout:** Function to sign out.
- **name:** "Code Grader".
- **author:** "The Devs".
- **baseUrl:** NEXT_PUBLIC_URL.

## Usage:

```
import { useMetadata } from "@/context";

// Access Data
const { user, logout } = useMetadata();
```
