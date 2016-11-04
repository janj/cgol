class Conway
  attr_accessor :board, :size

  def initialize(board: nil, size: 10)
    @board = board || random_board(size)
    @size = @board.size
  end

  def run
    steps = 0
    repeating = false
    while !repeating
      print_board
      last_board = board
      self.board = step
      steps += 1
      repeating = last_board == board
      sleep(1)
    end
    "At stable state after #{steps} steps"
  end

  def print_board
    puts '---'*size
    board.each do |col|
      col.each { |c| print c == 1 ? 'X' : ' '}
      puts
    end
    puts '---'*size
  end

  def step
    (0..(size-1)).map do |col_idx|
      (0..(size-1)).map do |row_idx|
        alive_or_dead(col_idx, row_idx)
      end
    end
  end

  def alive_or_dead(col_idx, row_idx)
    case count_neighbors(col_idx, row_idx)
    when 2
      board[col_idx][row_idx]
    when 3
      1
    else
      0
    end
  end

  def count_neighbors(col_idx, row_idx)
    neighbors(col_idx, row_idx).map do |col_idx, row_idx|
      board[col_idx][row_idx] 
    end.inject(0) { |sum, n| sum + n }
  end

  def neighbors(col_idx, row_idx)
    [
      [col_idx-1, row_idx-1],
      [col_idx-1, row_idx],
      [col_idx-1, row_idx+1],

      [col_idx, row_idx-1],
      [col_idx, row_idx+1],

      [col_idx+1, row_idx-1],
      [col_idx+1, row_idx],
      [col_idx+1, row_idx+1],      
    ].select { |col_idx, row_idx| is_valid_cordinate(col_idx, row_idx) }
  end

  def is_valid_cordinate(col_idx, row_idx)
    col_idx>=0 && col_idx<size && row_idx>=0 && row_idx<size
  end

  def random_board(size)
    (0..(size-1)).map { |col_idx| (0..(size-1)).map { |row_idx| rand(2) }}
  end
end

class ConwayTest
  def self.run_all
    ['is_valid_cordinate_test', 'neighbors_test'].each do |test|
      puts test
      print_errors(ConwayTest.send(test))
      puts
    end
  end

  def self.neighbors_test
    c = Conway.new(size: 5)
    top_left_neighbors = c.neighbors(0, 0).sort
    expected_top_left = [[0, 1], [1, 0], [1, 1]]
    bottom_right_neighbors = c.neighbors(4, 4).sort
    expected_bottom_right = [[3, 3], [3, 4], [4, 3]]
    middle_neighbors = c.neighbors(2, 2).sort
    expected_middle = [[1, 1], [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2], [3, 3]]
    [].tap do |errors|
      errors << "top left expected #{expected_top_left} got #{top_left_neighbors}" unless top_left_neighbors == expected_top_left
      errors << "bottom right expected #{expected_bottom_right} got #{bottom_right_neighbors}" unless bottom_right_neighbors == expected_bottom_right
      errors << "middle expected #{expected_middle} got #{middle_neighbors}" unless middle_neighbors == expected_middle
    end
  end

  def self.is_valid_cordinate_test
    c = Conway.new(size: 5)
    [].tap do |errors|
      errors << 'valid cordinate' unless c.is_valid_cordinate(0, 4)
      errors << 'col < 0' if c.is_valid_cordinate(-1, 2)
      errors << 'col > size' if c.is_valid_cordinate(5, 2)
      errors << 'row < 0' if c.is_valid_cordinate(1, -1)
      errors << 'row > size' if c.is_valid_cordinate(1, 5)
    end
  end

  def self.print_errors(errors)
    if errors.length == 0
      puts 'PASSED'
    else
      errors.each do |error|
        puts " - failed for #{error}"
      end
    end
  end
end


