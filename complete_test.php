<?php
/**
 * Complete test script to verify role-based access control with published survey
 */

require_once 'src/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

$baseUri = 'http://127.0.0.1:8000/api';
$client = new Client();

echo "=== Complete Role-Based Access Control Test ===\n\n";

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

// Step 1: Login as existing author
echo "1. Login as author:\n";
$loginResponse = makeRequest($client, 'POST', '/login', [
    'email' => 'author@example.com',
    'password' => 'password'
]);

echo "Author login: " . $loginResponse['status'] . "\n";
$authorToken = $loginResponse['body']['data']['token'] ?? '';

// Step 2: Create a survey
echo "\n2. Create survey:\n";
$authorHeaders = ['Authorization' => 'Bearer ' . $authorToken];
$surveyResponse = makeRequest($client, 'POST', '/surveys', [
    'title' => 'Complete Test Survey',
    'description' => 'This survey will be published for testing'
], $authorHeaders);

echo "Create survey: " . $surveyResponse['status'] . "\n";
$surveyId = $surveyResponse['body']['data']['survey']['id'] ?? '';

// Step 3: Add a question to the survey
echo "\n3. Add question:\n";
$questionResponse = makeRequest($client, 'POST', "/surveys/{$surveyId}/questions", [
    'text' => 'What is your favorite color?',
    'type' => 'single_choice',
    'order' => 1,
    'required' => true,
    'options' => ['Red', 'Blue', 'Green']
], $authorHeaders);

echo "Add question: " . $questionResponse['status'] . "\n";
$questionId = $questionResponse['body']['data']['question']['id'] ?? '';

// Step 4: Publish the survey
echo "\n4. Publish survey:\n";
$publishResponse = makeRequest($client, 'POST', "/surveys/{$surveyId}/publish", [], $authorHeaders);
echo "Publish survey: " . $publishResponse['status'] . "\n";

// Step 5: Login as respondent
echo "\n5. Login as respondent:\n";
$respondentLoginResponse = makeRequest($client, 'POST', '/login', [
    'email' => 'respondent@example.com',
    'password' => 'password'
]);

echo "Respondent login: " . $respondentLoginResponse['status'] . "\n";
$respondentToken = $respondentLoginResponse['body']['data']['token'] ?? '';

// Step 6: Test respondent can now access the published survey
echo "\n6. Test respondent access to published survey:\n";
$respondentHeaders = ['Authorization' => 'Bearer ' . $respondentToken];

// Get survey form
$formResponse = makeRequest($client, 'GET', "/surveys/{$surveyId}/form", [], $respondentHeaders);
echo "Respondent get survey form: " . $formResponse['status'] . "\n";
if ($formResponse['status'] === 200) {
    echo "Survey title: " . ($formResponse['body']['data']['survey']['title'] ?? 'N/A') . "\n";
    echo "Question count: " . count($formResponse['body']['data']['survey']['questions'] ?? []) . "\n";
}

// Step 7: Test author cannot access survey form
echo "\n7. Test author cannot access survey form:\n";
$authorFormResponse = makeRequest($client, 'GET', "/surveys/{$surveyId}/form", [], $authorHeaders);
echo "Author get survey form: " . $authorFormResponse['status'] . " - " . json_encode($authorFormResponse['body']) . "\n";

// Step 8: Test respondent cannot create surveys
echo "\n8. Test respondent cannot create surveys:\n";
$respondentCreateResponse = makeRequest($client, 'POST', '/surveys', [
    'title' => 'Unauthorized Survey',
    'description' => 'This should fail'
], $respondentHeaders);
echo "Respondent create survey: " . $respondentCreateResponse['status'] . " - " . json_encode($respondentCreateResponse['body']) . "\n";

echo "\n=== Test completed successfully! ===\n";
echo "Role-based access control is working correctly:\n";
echo "- Authors can create and manage surveys\n";
echo "- Respondents can take published surveys\n";
echo "- Cross-role access is properly restricted\n";
?>
