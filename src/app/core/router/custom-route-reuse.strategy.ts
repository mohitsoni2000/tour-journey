import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { BaseRouteReuseStrategy } from '@angular/router';

@Injectable()
export class CustomRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    // Check if the route has custom reuse configuration
    const shouldReuse = future.data['reuseRoute'] ?? true;

    // If route specifically sets reuseRoute to false, don't reuse
    if (!shouldReuse) {
      return false;
    }

    // Default behavior for other routes
    return future.routeConfig === curr.routeConfig;
  }

  // Implement other methods if needed
  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  override store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null
  ): void {
    // No storage needed
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }
}
