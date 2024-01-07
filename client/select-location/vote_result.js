var globalNum;
let presses = 1;
let pressesArray = Array(candidate_num).fill(1);

function updateProgressBar(voter_num) {
    const progressContainer = document.getElementById('container');

    //Create div container
    let container = document.createElement('div');
    
    // Create button element
    let button = document.createElement('button');
    button.id = 'voter-button' + voter_num;
    button.type = 'button';
    button.textContent = voters[voter_num];
    button.style.backgroundColor = 'gray';
    button.style.margin = '5px';
    button.style.padding = '10px';
    button.style.cursor = 'pointer';
    button.style.width = '300px';
    button.style.height = '50px';
    button.style.borderRadius = '50px';
    button.style.position = 'relative';
    button.style.overflow = 'hidden';

    // Create progress strip inside the button
    let progressStrip = document.createElement('div');
    progressStrip.classList.add('progress-strip');
    button.appendChild(progressStrip);
    
    // Store the accumulated width
    let accumulatedWidth = 0;

    // Add event listener to the button
    button.addEventListener('click', function () {
        if (presses < candidate_num) {
            accumulatedWidth += (1 / candidate_num) * button.clientWidth;
            updateButtonProgress(progressStrip, accumulatedWidth);
            presses++;
            pressesArray[voter_num]++;

            // Check if maximum presses reached
            if (presses === candidate_num) {
                button.disabled = true;
                disableAllButtons();
                determineWinner();
                showOverlay();
                triggerConfetti();
            }
        }
        else {
            accumulatedWidth += (1 / candidate_num) * button.clientWidth;
            updateButtonProgress(progressStrip, accumulatedWidth);
            button.disabled = true;
            disableAllButtons();
            determineWinner();
            showOverlay();
            triggerConfetti();
        }
    });

    container.appendChild(button);

    progressContainer.appendChild(container);
    globalNum = voter_num;
}

function updateButtonProgress(progressStrip, accumulatedWidth) {
    // Update the width of the progress strip
    progressStrip.style.width = accumulatedWidth + 'px';
}

function triggerConfetti() {
    // Use canvas-confetti library to create a confetti effect
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
    });
}

function showOverlay() {
    // Display the overlay
    const overlay = document.getElementById('overlay');
    // document.getElementById('trip').innerHTML = voters[globalNum];
    overlay.style.display = 'block';
}

// Function to disable all buttons
function disableAllButtons() {
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.disabled = true;
    });
}

// Function to determine the winner
function determineWinner() {
    const maxPresses = Math.max(...pressesArray);

    if (pressesArray.every(count => count === maxPresses)) {
        document.getElementById('trip').innerHTML = 'It\'s a tie!';
    } else {
        const maxPressesIndex = pressesArray.indexOf(maxPresses);
        document.getElementById('winner').innerHTML = 'Congratulations we have a WINNER!';
        document.getElementById('trip').innerHTML = "Let's go and have a TRIP in " + voters[maxPressesIndex];
        globalNum = maxPressesIndex;
    }
}
