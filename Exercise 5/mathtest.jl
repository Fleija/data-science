# ============= 1 =============
# Create two matrices of the same layout and test if addition and subtraction 
# of the matrix works as expected: C = A + B

# Creating a new 2x4 matrix
matrix1 = [[1, 1]  [1, 1]  [1, 1]] # 2x3 Matrix
matrix2 = [[2, 2]  [2, 2]  [2, 2]] # 2x3 Matrix

# Testing A + B = C
print("Testing A + B = C: ")
println(matrix1 + matrix2) # Output: [3 3 3; 3 3 3]

# Testing A - B = C
print("Testing A - B = C: ")
println(matrix1 - matrix2) # Output: [-1 -1 -1; -1 -1 -1]


println()
# ============= 2 =============
# Now compare matrix multiplication either this way A * B and this way 
# A .* B. Whats the difference?!

# Testing A * B
println("Testing A * B = C: ")
#println(matrix1 * matrix2) # Output: throws DimensionMismatch

# Testing A .* B
print("Testing A .* B = C: ")
println(matrix1 .* matrix2) # Output: [2 2 2; 2 2 2]


println()
# ============= 3 =============
# What about matrix division with "/" or "\"?!

# Testing A / B
print("Testing A / B: ")
println(matrix1 / matrix2) # Output: [0.25 0.25; 0.25 0.25]

# Testing A \ B
print("Testing A \\ B: ")
println(matrix1 \ matrix2) # Output: 
                        #   [0.666667 0.666667 0.666667; 
                        #   0.666667 0.666667 0.666667; 
                        #   0.666667 0.666667 0.666667]
            
                        
println()
# ============= 4 =============
# Create a 3x3 integer matrix A with useful numbers. 
# Now try A+1, A-1, A*2, A/2.

# Creating a new 3x3 matrix 
A = [[1, 4]  [2, 5]  [3, 6]] # 3x3 Matrix

# Testing A + 1
print("Testing A + 1: ")
println(A + 1) # Output: [2 3 4; 5 6 7]

# Testing A - 1
print("Testing A - 1: ")
println(A - 1) # Output: [0 1 2; 3 4 5]

# Testing A * 2
print("Testing A * 2: ")
println(A * 2) # Output: [2 4 6; 8 10 12]

# Testing A / 2
print("Testing A / 2: ")
println(A / 2) # Output: [0.5 1.0 1.5; 2.0 2.5 3.0]


println()
# ============= 5 =============
# Now multiply a 3x4 matrix with a suitable (4)vector.
matrix = [[1, 5, 9]  [2, 6, 10]  [3, 7, 11] [4, 8, 12]] # 3x4 Matrix
vector = [2, 2, 2, 2]

# Testing matrix * vector
print("Testing Matrix * Vector: ")
println(matrix * vector) # Output: [20, 52, 84]