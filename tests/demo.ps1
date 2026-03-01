# Test script for authentication and survey CRUD using PowerShell
# Run this script after starting the Laravel server with php artisan serve

$baseUrl = "http://localhost:8000/api"

Write-Host "Starting API tests..."

# Generate unique email for test
$email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"

# 1. Test Registration
Write-Host "`n1. Testing Registration..."
$registerBody = @{
    name = "Test User"
    email = $email
    password = "password123"
    password_confirmation = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/register" -Method Post -Body $registerBody -ContentType "application/json"
    $registerData = $registerResponse.Content | ConvertFrom-Json
    if ($registerData.success) {
        Write-Host "Registration successful: $($registerData.message)"
    } else {
        Write-Host "Registration failed: $($registerData.message)"
    }
} catch {
    Write-Host "Registration error: $($_.Exception.Message)"
}

# 2. Test Login
Write-Host "`n2. Testing Login..."
$loginBody = @{
    email = $email
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    if ($loginData.success) {
        $token = $loginData.data.token
        Write-Host "Login successful. Token: $token"
    } else {
        Write-Host "Login failed: $($loginData.message)"
        exit
    }
} catch {
    Write-Host "Login error: $($_.Exception.Message)"
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Test Get User Info
Write-Host "`n3. Testing Get User Info..."
try {
    $userResponse = Invoke-WebRequest -Uri "$baseUrl/user" -Method Get -Headers $headers
    $userData = $userResponse.Content | ConvertFrom-Json
    if ($userData.success) {
        Write-Host "User info retrieved: $($userData.data.user.name)"
    } else {
        Write-Host "Failed to get user info: $($userData.message)"
    }
} catch {
    Write-Host "Get user info error: $($_.Exception.Message)"
}

# 4. Test Create Survey
Write-Host "`n4. Testing Create Survey..."
$surveyBody = @{
    title = "Test Survey"
    description = "This is a test survey"
} | ConvertTo-Json

try {
    $surveyResponse = Invoke-WebRequest -Uri "$baseUrl/surveys" -Method Post -Body $surveyBody -Headers $headers
    $surveyData = $surveyResponse.Content | ConvertFrom-Json
    if ($surveyData.success) {
        $surveyId = $surveyData.data.survey.id
        Write-Host "Survey created: $($surveyData.data.survey.title) (ID: $surveyId)"
    } else {
        Write-Host "Failed to create survey: $($surveyData.message)"
        exit
    }
} catch {
    Write-Host "Create survey error: $($_.Exception.Message)"
    exit
}

# 5. Test Add Text Question
Write-Host "`n5. Testing Add Text Question..."
$textQuestionBody = @{
    text = "What is your name?"
    type = "text"
    order = 1
} | ConvertTo-Json

try {
    $questionResponse = Invoke-WebRequest -Uri "$baseUrl/surveys/$surveyId/questions" -Method Post -Body $textQuestionBody -Headers $headers
    $questionData = $questionResponse.Content | ConvertFrom-Json
    if ($questionData.success) {
        $textQuestionId = $questionData.data.question.id
        Write-Host "Text question added: $($questionData.data.question.text) (ID: $textQuestionId)"
    } else {
        Write-Host "Failed to add text question: $($questionData.message)"
    }
} catch {
    Write-Host "Add text question error: $($_.Exception.Message)"
}

# 6. Test Add Single Choice Question
Write-Host "`n6. Testing Add Single Choice Question..."
$singleChoiceBody = @{
    text = "What is your favorite color?"
    type = "single_choice"
    order = 2
} | ConvertTo-Json

try {
    $singleResponse = Invoke-WebRequest -Uri "$baseUrl/surveys/$surveyId/questions" -Method Post -Body $singleChoiceBody -Headers $headers
    $singleData = $singleResponse.Content | ConvertFrom-Json
    if ($singleData.success) {
        $singleQuestionId = $singleData.data.question.id
        Write-Host "Single choice question added: $($singleData.data.question.text) (ID: $singleQuestionId)"
    } else {
        Write-Host "Failed to add single choice question: $($singleData.message)"
        exit
    }
} catch {
    Write-Host "Add single choice question error: $($_.Exception.Message)"
    exit
}

# 7. Test Add Options to Single Choice Question
Write-Host "`n7. Testing Add Options to Single Choice Question..."
$option1Body = @{
    text = "Red"
} | ConvertTo-Json

try {
    $option1Response = Invoke-WebRequest -Uri "$baseUrl/questions/$singleQuestionId/options" -Method Post -Body $option1Body -Headers $headers
    $option1Data = $option1Response.Content | ConvertFrom-Json
    if ($option1Data.success) {
        $redId = $option1Data.data.option.id
        Write-Host "Option added: $($option1Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

$option2Body = @{
    text = "Blue"
} | ConvertTo-Json

try {
    $option2Response = Invoke-WebRequest -Uri "$baseUrl/questions/$singleQuestionId/options" -Method Post -Body $option2Body -Headers $headers
    $option2Data = $option2Response.Content | ConvertFrom-Json
    if ($option2Data.success) {
        $blueId = $option2Data.data.option.id
        Write-Host "Option added: $($option2Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

# 7.5. Add more options to Single Choice for validation
Write-Host "`n7.5. Adding more options to Single Choice Question..."
$option3Body = @{
    text = "Green"
} | ConvertTo-Json

try {
    $option3Response = Invoke-WebRequest -Uri "$baseUrl/questions/$singleQuestionId/options" -Method Post -Body $option3Body -Headers $headers
    $option3Data = $option3Response.Content | ConvertFrom-Json
    if ($option3Data.success) {
        Write-Host "Option added: $($option3Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

$option4Body = @{
    text = "Yellow"
} | ConvertTo-Json

try {
    $option4Response = Invoke-WebRequest -Uri "$baseUrl/questions/$singleQuestionId/options" -Method Post -Body $option4Body -Headers $headers
    $option4Data = $option4Response.Content | ConvertFrom-Json
    if ($option4Data.success) {
        Write-Host "Option added: $($option4Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

# 8. Test Add Multiple Choice Question
Write-Host "`n8. Testing Add Multiple Choice Question..."
$multipleChoiceBody = @{
    text = "Which programming languages do you know?"
    type = "multiple_choice"
    order = 3
} | ConvertTo-Json

try {
    $multipleResponse = Invoke-WebRequest -Uri "$baseUrl/surveys/$surveyId/questions" -Method Post -Body $multipleChoiceBody -Headers $headers
    $multipleData = $multipleResponse.Content | ConvertFrom-Json
    if ($multipleData.success) {
        $multipleQuestionId = $multipleData.data.question.id
        Write-Host "Multiple choice question added: $($multipleData.data.question.text) (ID: $multipleQuestionId)"
    } else {
        Write-Host "Failed to add multiple choice question: $($multipleData.message)"
        exit
    }
} catch {
    Write-Host "Add multiple choice question error: $($_.Exception.Message)"
    exit
}

# 9. Test Add Options to Multiple Choice Question
Write-Host "`n9. Testing Add Options to Multiple Choice Question..."
$option3Body = @{
    text = "PHP"
} | ConvertTo-Json

try {
    $option3Response = Invoke-WebRequest -Uri "$baseUrl/questions/$multipleQuestionId/options" -Method Post -Body $option3Body -Headers $headers
    $option3Data = $option3Response.Content | ConvertFrom-Json
    if ($option3Data.success) {
        $phpId = $option3Data.data.option.id
        Write-Host "Option added: $($option3Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

$option4Body = @{
    text = "JavaScript"
} | ConvertTo-Json

try {
    $option4Response = Invoke-WebRequest -Uri "$baseUrl/questions/$multipleQuestionId/options" -Method Post -Body $option4Body -Headers $headers
    $option4Data = $option4Response.Content | ConvertFrom-Json
    if ($option4Data.success) {
        $jsId = $option4Data.data.option.id
        Write-Host "Option added: $($option4Data.data.option.text)"
    }
} catch {
    Write-Host "Add option error: $($_.Exception.Message)"
}

# 10. Test Retrieve Survey with Questions and Options
Write-Host "`n10. Testing Retrieve Survey..."
try {
    $getSurveyResponse = Invoke-WebRequest -Uri "$baseUrl/surveys/$surveyId" -Method Get -Headers $headers
    $getSurveyData = $getSurveyResponse.Content | ConvertFrom-Json
    if ($getSurveyData.success) {
        Write-Host "Survey retrieved: $($getSurveyData.data.survey.title)"
        Write-Host "Questions count: $($getSurveyData.data.survey.questions.Count)"
        foreach ($question in $getSurveyData.data.survey.questions) {
            Write-Host "  Question: $($question.text) - Type: $($question.type)"
            if ($question.options) {
                Write-Host "    Options: $($question.options.Count)"
                foreach ($option in $question.options) {
                    Write-Host "      - $($option.text)"
                }
            }
        }
    } else {
        Write-Host "Failed to retrieve survey: $($getSurveyData.message)"
    }
} catch {
    Write-Host "Retrieve survey error: $($_.Exception.Message)"
}

# 11. Test Validation: Try to Add Option to Text Question
Write-Host "`n11. Testing Validation: Add Option to Text Question..."
$invalidOptionBody = @{
    text = "Invalid Option"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-WebRequest -Uri "$baseUrl/questions/$textQuestionId/options" -Method Post -Body $invalidOptionBody -Headers $headers
    $invalidData = $invalidResponse.Content | ConvertFrom-Json
    Write-Host "Unexpected success: $($invalidData.message)"
} catch {
    $errorData = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader($_)).ReadToEnd() } | ConvertFrom-Json
    Write-Host "Validation error (expected): $($errorData.message)"
}

# 11.5. Testing Submit Answers
Write-Host "`n11.5. Testing Submit Answers..."
$answersBody = @{
    answers = @(
        @{
            question_id = $textQuestionId
            answer_text = "John Doe"
        }
        @{
            question_id = $singleQuestionId
            option_ids = @($redId)
        }
        @{
            question_id = $multipleQuestionId
            answer_text = "Some text answer"
        }
    )
} | ConvertTo-Json

try {
    $submitResponse = Invoke-WebRequest -Uri "$baseUrl/surveys/$surveyId/responses" -Method Post -Body $answersBody -Headers $headers
    $submitData = $submitResponse.Content | ConvertFrom-Json
    if ($submitData.success) {
        Write-Host "Answers submitted successfully"
    } else {
        Write-Host "Failed to submit answers: $($submitData.message)"
    }
} catch {
    Write-Host "Submit answers error: $($_.Exception.Message)"
}

# 12. Test Unauthorized Access
Write-Host "`n12. Testing Unauthorized Access..."
try {
    $unauthResponse = Invoke-WebRequest -Uri "$baseUrl/surveys" -Method Get
    Write-Host "Unexpected success without auth"
} catch {
    try {
        $unauthError = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader($_)).ReadToEnd() }
        $unauthData = $unauthError | ConvertFrom-Json
        Write-Host "Unauthorized error (expected): $($unauthData.message)"
    } catch {
        Write-Host "Unauthorized error (expected): Response received"
    }
}

Write-Host "`nAll tests completed!"
