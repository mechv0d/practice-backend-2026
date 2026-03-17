<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        try {
            $user = JWTAuth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Check if user has the required role
            if ($role === 'author' && !$user->isAuthor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Author role required.'
                ], 403);
            }

            if ($role === 'respondent' && !$user->isRespondent()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Respondent role required.'
                ], 403);
            }

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication error'
            ], 401);
        }
    }
}
