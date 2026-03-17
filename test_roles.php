<?php
/**
 * Test script to verify role-based access control
 */

require_once 'src/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

$baseUri = 'http://127.0.0.1:8000/api';
$client = new Client();

echo "=== Testing Role-Based Access Control ===\n\n";

function makeRequest($client, $method, $uri, $data = [], $headers = []) {
    global $baseUri;
    try {
        $options = [];
        if (!empty($data)) {
            $options['json'] = $data;
        }
        if (!empty($headers)) {
            $options['headers'] = $headers;
        }
        
        $fullUri = $baseUri . $uri;
        $response = $client->request($method, $fullUri, $options);
        return [
            'status' => $response->getStatusCode(),
            'body' => json_decode($response->getBody(), true)
        ];
    } catch (RequestException $e) {
        return [
            'status' => $e->hasResponse() ? $e->getResponse()->getStatusCode() : 500,
            'body' => $e->hasResponse() ? json_decode($e->getResponse()->getBody(), true) : ['message' => $e->getMessage()]
        ];
    }
}

// Test 1: Register users with different roles
echo "1. Testing user registration with roles:\n";

// Register author
$authorResponse = makeRequest($client, 'POST', '/register', [
    'name' => 'Test Author New',
    'email' => 'author_new@example.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'role' => 'author'
]);

echo "Author registration: " . $authorResponse['status'] . " - " . json_encode($authorResponse['body']) . "\n";

// Register respondent
$respondentResponse = makeRequest($client, 'POST', '/register', [
    'name' => 'Test Respondent New',
    'email' => 'respondent_new@example.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'role' => 'respondent'
]);

echo "Respondent registration: " . $respondentResponse['status'] . " - " . json_encode($respondentResponse['body']) . "\n\n";

// Get tokens
$authorToken = $authorResponse['body']['data']['token'] ?? '';
$respondentToken = $respondentResponse['body']['data']['token'] ?? '';

// Test 2: Test author permissions
echo "2. Testing author permissions:\n";

$authorHeaders = ['Authorization' => 'Bearer ' . $authorToken];

// Author should be able to create survey
$surveyResponse = makeRequest($client, 'POST', '/surveys', [
    'title' => 'Test Survey by Author',
    'description' => 'This is a test survey'
], $authorHeaders);
echo "Author create survey: " . $surveyResponse['status'] . "\n";

// Get survey ID for further tests
$surveyId = $surveyResponse['body']['data']['survey']['id'] ?? '';

// Test 3: Test respondent permissions
echo "\n3. Testing respondent permissions:\n";

$respondentHeaders = ['Authorization' => 'Bearer ' . $respondentToken];

// Respondent should NOT be able to create survey
$respondentCreateResponse = makeRequest($client, 'POST', '/surveys', [
    'title' => 'Test Survey by Respondent',
    'description' => 'This should fail'
], $respondentHeaders);
echo "Respondent create survey: " . $respondentCreateResponse['status'] . " - " . json_encode($respondentCreateResponse['body']) . "\n";

// Respondent should be able to take survey
$formResponse = makeRequest($client, 'GET', '/surveys/' . $surveyId . '/form', [], $respondentHeaders);
echo "Respondent get survey form: " . $formResponse['status'] . "\n";

// Test 4: Test cross-role access
echo "\n4. Testing cross-role access:\n";

// Author should NOT be able to take survey
$authorTakeResponse = makeRequest($client, 'GET', '/surveys/' . $surveyId . '/form', [], $authorHeaders);
echo "Author get survey form: " . $authorTakeResponse['status'] . " - " . json_encode($authorTakeResponse['body']) . "\n";

echo "\n=== Test completed ===\n";
?>
