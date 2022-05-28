# Choosing a random number between 1 and 100
randomize <- function() {
    # Returns the random number
    return(sample(1:100, 1))
}

# Main function of the game - will be recursively called if guessed wrong
guess <- function(random) {
    # Prints to show the player how to play
    print("Versuche die unbekannte Zahl zu erraten!")

    # Reads users input and converts it to an integer
    userguess <- as.integer(readline(prompt = "Deine Zahl: "))

    # Checks if the user guessed right
    if (userguess > random) { # Too high
        print(paste("Falsch! Die gesuchte Zahl ist kleiner als", userguess))
        guess(random) # Asks for another guess
    } else if (userguess < random) { # Too low
        print(paste("Falsch! Die gesuchte Zahl ist größer als", userguess))
        guess(random) # Asks for another guess
    } else { # Right guess
        print(paste("Richtig! Die gesuchte Zahl ist", random))
    }
}

gamehandler <- function() {
    print("Eine Zahl zwischen 0 und 100 wird ausgelost!")
    guess(randomize())
}

# Initial game start
gamehandler()