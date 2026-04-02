using FluentValidation;
using OcufiiAPI.DTO;

namespace OcufiiAPI.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters");

            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\+?[1-9]\d{1,14}$").When(x => !string.IsNullOrEmpty(x.PhoneNumber))
                .WithMessage("Invalid phone number format (E.164 recommended)");

            RuleFor(x => x.Age)
                .InclusiveBetween(0, 120).When(x => x.Age.HasValue)
                .WithMessage("Age must be between 0 and 120");

            RuleFor(x => x.DateOfBirth)
                .Must(BeValidPastDate).When(x => x.DateOfBirth.HasValue)
                .WithMessage("Date of birth must be a valid past date");

            RuleFor(x => x.Gender)
                .Must(g => string.IsNullOrEmpty(g) ||
                          g.Equals("Male", StringComparison.OrdinalIgnoreCase) ||
                          g.Equals("Female", StringComparison.OrdinalIgnoreCase) ||
                          g.Equals("Other", StringComparison.OrdinalIgnoreCase) ||
                          g.Equals("PreferNotToSay", StringComparison.OrdinalIgnoreCase))
                .When(x => !string.IsNullOrEmpty(x.Gender))
                .WithMessage("Gender must be Male, Female, Other, or PreferNotToSay");

            RuleFor(x => x.TermsOfServiceAccepted)
                .Equal(true).WithMessage("You must accept the Terms of Service to register");
        }

        private bool BeValidPastDate(DateTime? date)
        {
            return date.HasValue && date.Value < DateTime.UtcNow.Date;
        }
    }
}
