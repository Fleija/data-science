
#The field to play on
field = [[0 for i in range(6)] for j in range(6)]

#The current active player. Starts with 1
active = 1

#Variables to print the field
head = " |  1  |  2  |  3  |  4  |  5  |  6  |"
divider = " -------------------------------------"
pipe = " | "
cross = "X"
circle = "O"
blank = " "

#Starts the game
def start_game():
    print("Willkommen zum Spiel Vier Gewinnt!")
    print("Ziel des Spiels ist es vier gleiche Zeichen horizontal, vertikal oder diagonal anzuordnen")
    print("Dieses Spiel ist für zwei Spieler gemacht. Los gehts!")
    draw_board()
    move()

#Asks for user input to move
def move():  
    print("Spieler " + str(active) + " ist am Zug!")
    val = input("Wohin soll ein Stein gesetzt werden? Nr. der Spalte: ")
    check_move(val)

#Changes the active player 
def change_player():
    global active
    if active == 1:
        active = 2
    else: 
        active = 1
    move()

#Sets a new stone on the field
def set_move(input):
    for row in reversed(range(6)):
        if field[row][input - 1] == 0:
            field[row][input - 1] = active
            draw_board()
            check_win(row, input - 1)            
            break
        elif row == 0:
            print("Diese Spalte ist voll. Bitte wähle eine andere Spalte!")
            move()

#Checks if the move is legal
def check_move(input):
    column = int(input)
    for i in range(6):
        if column == (i + 1):
            set_move(column)
            break    
        elif i == 5:
            print("Fehlerhafte Eingabe!")
            move()

#Checks if the game is won
def check_win(row, column):
    if ((is_active(row + 1, column) and is_active(row + 2, column) and is_active(row + 3, column)) or 
        #horizontal
        #xooo
        (is_active(row, column + 1) and is_active(row, column + 2) and is_active(row, column + 3)) or 
        #oxoo
        (is_active(row, column - 1) and is_active(row, column + 1) and is_active(row, column + 2)) or 
        #ooxo
        (is_active(row, column - 2) and is_active(row, column - 1) and is_active(row, column + 1)) or 
        #ooox
        (is_active(row, column - 3) and is_active(row, column - 2) and is_active(row, column - 1)) or 
        #diagonal nach rechts oben
        #xooo
        (is_active(row - 1, column + 1) and is_active(row - 2, column + 2) and is_active(row - 3, column + 3)) or 
        #oxoo
        (is_active(row + 1, column - 1) and is_active(row - 1, column + 1) and is_active(row - 2, column + 2)) or 
        #ooxo
        (is_active(row + 2, column - 2) and is_active(row + 1, column - 1) and is_active(row - 1, column + 1)) or 
        #ooox
        (is_active(row + 3, column - 3) and is_active(row + 2, column - 2) and is_active(row + 1, column - 1)) or 
        #diagonal nach links oben
        #xooo
        (is_active(row + 1, column + 1) and is_active(row + 2, column + 2) and is_active(row + 3, column + 3)) or 
        #oxoo
        (is_active(row - 1, column - 1) and is_active(row + 1, column + 1) and is_active(row + 2, column + 2)) or 
        #ooxo
        (is_active(row - 2, column - 2) and is_active(row - 1, column - 1) and is_active(row + 1, column + 1)) or 
        #ooox
        (is_active(row - 3, column - 3) and is_active(row - 2, column - 3) and is_active(row - 1, column - 1))):
            print("Spieler " + str(active) + " hat gewonnen! Glückwunsch!")
    else:
        change_player()

#Tests if a spot on the field is occupied by the current active player
def is_active(row, column):
    if (row >= len(field) or row < 0): return False
    if (column >= len(field[row]) or column < 0): return False
    return field[row][column] == active

#Draws the board
def draw_board():
    print(divider)
    print(head)
    print(divider)
    print(divider)
    for row in field:
        for cell in row:
            print(pipe, end = blank)
            if cell == 0: #change to 0
                print(blank, end = blank)
            elif cell == 1:
                print(cross, end = blank)
            else:
                print(circle, end = blank)
        print(pipe)    
        print(divider)

#Initial game start
start_game()

