# SAASFrontendAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Configuration

### Setting up API URL

The API URL is configured in `src/environments/environment.ts`. If your backend runs on a different port (e.g., MacBook users or different configurations), update the `apiUrl`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // Change port if needed (e.g., 3001, 3000, etc.)
};
```

**Default:** `http://localhost:5000/api`

**For different ports:** Just change the port number in the URL above. No need to modify any service files!

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
