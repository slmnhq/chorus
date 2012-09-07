require_relative "../../packaging/install/installer_io"

RSpec.configure do |config|
  config.mock_with :rr
end

describe InstallerIO do
  let(:io) { described_class.new(silent) }
  let(:silent) { false }

  describe "#prompt_or_default" do
    subject { io.prompt_or_default(:sym, "default") }

    context "in silent mode" do
      let(:silent) { true }
      before do
        dont_allow(io).prompt
      end

      it { should == "default" }
    end

    context "normal mode" do
      let(:silent) { false }
      before do
        mock(io).prompt(:sym, "default") { user_input }
      end

      context "when the user accepts the default" do
        let(:user_input) { nil }

        it { should == "default" }
      end

      context "when the user types something" do
        let(:user_input) { "something" }

        it { should == "something" }
      end
    end
  end

  describe "#require_confirmation" do
    subject { io.require_confirmation(:sym) }

    before do
      mock(io).prompt_or_default(:sym, 'y') { user_input }
    end

    ['y', 'yEs'].each do |input|
      context "when the user confirms with #{input.inspect}" do
        let(:user_input) { input }

        it "should not cancel the install" do
          expect { subject }.not_to raise_error(InstallerErrors::InstallAborted, /Cancelled by user/)
        end
      end
    end

    context "when the user doesn't confirm" do
      let(:user_input) { "not a yes" }

      it "should cause the install to be cancelled" do
        expect { subject }.to raise_error(InstallerErrors::InstallAborted, /Cancelled by user/)
      end
    end
  end

  describe "#prompt_until" do
    before do
      mock(io).prompt(:sym).times(prompt_times) { user_inputs.shift }
    end

    context "when the user's input matches right away" do
      let(:prompt_times) { 1 }
      let(:user_inputs) { %w(hi) }

      it "should return the user's input" do
        io.prompt_until(:sym) do |input|
          true
        end.should == 'hi'
      end
    end

    context "when the user's input does not match immediately" do
      let(:prompt_times) { 3 }
      let(:user_inputs) { %w(foo bar baz) }

      it "should prompt until the input matches and return the allowed input" do
        io.prompt_until(:sym) do |input|
          input == 'baz'
        end.should == 'baz'
      end
    end
  end
end